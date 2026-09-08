import * as express from 'express';
import * as http from 'http';
import { Writable } from 'stream';
import * as winstonTypes from 'winston';

// The ANSI escape byte, built rather than written literally: a raw escape
// character inside a regex literal trips eslint no-control-regex.
const ESC = String.fromCharCode(27);

// These logs are scraped off Heroku's stdout, so their exact shape is part of
// the contract. winston 3 moved `colorize` / `json` from transport options to
// composable formats, which makes it very easy to change that shape by
// accident; everything below pins the shape winston 2 produced.

interface LoggingModule {
  default: {
    errorLogger: express.ErrorRequestHandler;
    requestLogger: express.RequestHandler;
  };
  errorLoggerInstance: winstonTypes.Logger;
  requestLoggerInstance: winstonTypes.Logger;
}

interface Loaded {
  logging: LoggingModule;
  winston: typeof winstonTypes;
}

// logging.ts decides whether to colourise once, at module load, from
// Config.get('NODE_ENV') -- and nconf snapshots process.env when config.ts is
// first required. So each mode needs its own module registry. winston is
// re-required from inside the same registry so that the transport added below
// is the same class the logger under test is using.
function loadLogging(nodeEnv: string): Loaded {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = nodeEnv;
  let loaded: Loaded | undefined;
  jest.isolateModules(() => {
    loaded = {
      logging: require('./logging') as LoggingModule,
      winston: require('winston') as typeof winstonTypes,
    };
  });
  process.env.NODE_ENV = previous;
  if (!loaded) {
    throw new Error('jest.isolateModules did not run its callback');
  }
  return loaded;
}

// Swaps the logger's Console transport for one that appends to `lines`. The
// format lives on the logger, not the transport, so the captured string is
// character-for-character what the Console transport would have printed.
function captureInto(
  loaded: Loaded,
  logger: winstonTypes.Logger,
  lines: string[],
): void {
  expect(logger.transports.map(t => t.constructor.name)).toEqual(['Console']);
  logger.clear();
  logger.add(
    new loaded.winston.transports.Stream({
      eol: '\n',
      stream: new Writable({
        write(chunk: Buffer | string, encoding, callback) {
          lines.push(String(chunk));
          callback();
        },
      }),
    }),
  );
}

interface Result {
  status: number;
  body: string;
}

function get(port: number, path: string): Promise<Result> {
  return new Promise((resolve, reject) => {
    const request = http.request(
      // Node's global agent keeps sockets alive, which would keep
      // `server.close()` from ever calling back.
      { agent: false, host: '127.0.0.1', port, method: 'GET', path },
      res => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', d => (data += d));
        res.on('end', () =>
          resolve({ status: res.statusCode || 0, body: data }),
        );
      },
    );
    request.on('error', reject);
    request.end();
  });
}

interface Harness {
  errors: string[];
  port: number;
  requests: string[];
  server: http.Server;
}

// Mirrors services/api/src/index.ts: requestLogger first, errorLogger after
// the routes, then the 404 and 500 handlers.
function start(nodeEnv: string): Promise<Harness> {
  const loaded = loadLogging(nodeEnv);
  const requests: string[] = [];
  const errors: string[] = [];
  captureInto(loaded, loaded.logging.requestLoggerInstance, requests);
  captureInto(loaded, loaded.logging.errorLoggerInstance, errors);

  const app = express();
  app.use(loaded.logging.default.requestLogger);
  app.get('/ok', (req, res) => {
    res.status(200).send('fine');
  });
  app.get('/boom', () => {
    throw new Error('deliberate explosion');
  });
  app.use(loaded.logging.default.errorLogger);
  app.use((req: express.Request, res: express.Response) => {
    res.status(404).send('Not Found');
  });
  app.use(
    (
      err: Error,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      res.status(500).send('Something broke!');
    },
  );

  const server = http.createServer(app);
  return new Promise<Harness>((resolve, reject) =>
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (address === null || typeof address === 'string') {
        return reject(new Error('Expected a TCP address'));
      }
      resolve({ errors, port: address.port, requests, server });
    }),
  );
}

function stop(harness: Harness): Promise<void> {
  return new Promise<void>(resolve => harness.server.close(() => resolve()));
}

describe('logging', () => {
  describe('requestLogger', () => {
    test('logs one plain "<level>: <method> <url> <status> <ms>ms" line in production', () => {
      let harness: Harness;
      return start('production')
        .then(h => {
          harness = h;
          return get(h.port, '/ok');
        })
        .then(res => {
          expect(res.status).toEqual(200);
          expect(harness.requests.length).toEqual(1);
          // Exactly what winston 2 printed with `{colorize: false, json: false}`.
          expect(harness.requests[0]).toMatch(/^info: GET \/ok 200 \d+ms\n$/);
          return stop(harness);
        });
    });

    test('colourises only the level outside production', () => {
      let harness: Harness;
      return start('dev')
        .then(h => {
          harness = h;
          return get(h.port, '/ok');
        })
        .then(() => {
          expect(harness.requests.length).toEqual(1);
          expect(harness.requests[0]).toMatch(
            new RegExp(`^${ESC}\\[32minfo${ESC}\\[39m: GET /ok 200 \\d+ms\\n$`),
          );
          return stop(harness);
        });
    });

    test('logs 404s and 500s at info, like every other request', () => {
      let harness: Harness;
      return start('production')
        .then(h => {
          harness = h;
          return get(h.port, '/nope');
        })
        .then(res => {
          expect(res.status).toEqual(404);
          expect(harness.requests[0]).toMatch(/^info: GET \/nope 404 \d+ms\n$/);
          return get(harness.port, '/boom');
        })
        .then(res => {
          expect(res.status).toEqual(500);
          expect(harness.requests[1]).toMatch(/^info: GET \/boom 500 \d+ms\n$/);
          return stop(harness);
        });
    });
  });

  describe('errorLogger', () => {
    test('logs one pretty-printed JSON object with the diagnostics at the top level', () => {
      let harness: Harness;
      return start('production')
        .then(h => {
          harness = h;
          return get(h.port, '/boom');
        })
        .then(res => {
          expect(res.status).toEqual(500);
          expect(harness.errors.length).toEqual(1);
          const raw = harness.errors[0];

          // JSON, never colourised -- winston 2 ignored `colorize` whenever
          // `json: true` was set, and this output is machine-read.
          expect(raw).not.toContain(ESC);
          // 2-space indented, as winston 2's `json: true` console output was.
          expect(raw).toContain('\n  "level": "error"');

          const parsed = JSON.parse(raw);
          expect(parsed.level).toEqual('error');
          expect(parsed.message).toEqual('middlewareError');
          // Exactly the key set winston 2 / express-winston 2 produced, at the
          // top level. Two things would break this: express-winston 4 nests it
          // all under `meta` unless `metaField` is null, and winston 3's
          // ExceptionHandler adds `error` and `exception` fields that v2 had
          // no equivalent of. Key *order* is not asserted -- winston 3 emits
          // these in a different order than v2 did, and `deterministic: false`
          // just means the file keeps whatever order the library used.
          expect(Object.keys(parsed).sort()).toEqual([
            'date',
            'level',
            'message',
            'os',
            'process',
            'req',
            'stack',
            'trace',
          ]);
          expect(parsed.req.url).toEqual('/boom');
          expect(parsed.req.method).toEqual('GET');
          // winston 2 split this into an array of lines; winston 3's
          // getAllInfo() hands over `err.stack` verbatim.
          expect(typeof parsed.stack).toEqual('string');
          expect(parsed.stack).toContain('Error: deliberate explosion');
          expect(Array.isArray(parsed.trace)).toEqual(true);
          return stop(harness);
        });
    });

    test('stays quiet for requests that do not error', () => {
      let harness: Harness;
      return start('production')
        .then(h => {
          harness = h;
          return get(h.port, '/ok');
        })
        .then(() => {
          expect(harness.errors).toEqual([]);
          return stop(harness);
        });
    });
  });
});

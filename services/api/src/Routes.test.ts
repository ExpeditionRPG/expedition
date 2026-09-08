import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as session from 'express-session';
import * as http from 'http';
import Config from './config';
import { Database } from './models/Database';
import { testingDBWithState } from './models/TestData';
import { installRoutes } from './Routes';

interface Result {
  status: number;
  body: string;
}

describe('Routes', () => {
  test.skip('Blocks CORS requests from rogue origins', () => {
    /* TODO */
  });
  test.skip('Requires auth to access user information', () => {
    /* TODO */
  });

  // Sequelize 5 resolved to bluebird promises, where an unhandled rejection is
  // only a printed warning. Sequelize 6 resolves to native promises, and Node
  // >= 15 terminates the process on an unhandled rejection. Handlers.feedback
  // deliberately rejects after it has answered and logged -- its own unit tests
  // assert that -- and the route deliberately does not await it, so the route
  // is what has to absorb the rejection. Every case below took the API server
  // down before that catch existed.
  describe('POST /quest/feedback/:type failures leave no unhandled rejection', () => {
    let db: Database;
    let server: http.Server;
    let port: number;
    let unhandled: unknown[];
    const record = (reason: unknown) => unhandled.push(reason);

    function post(path: string, body: string): Promise<Result> {
      return new Promise((resolve, reject) => {
        const r = http.request(
          {
            host: '127.0.0.1',
            port,
            method: 'POST',
            path,
            headers: {
              'content-type': 'text/plain',
              'content-length': String(Buffer.byteLength(body)),
            },
          },
          res => {
            let data = '';
            res.setEncoding('utf8');
            res.on('data', d => (data += d));
            res.on('end', () =>
              resolve({ status: res.statusCode || 0, body: data }),
            );
          },
        );
        r.on('error', reject);
        r.end(body);
      });
    }

    // An unhandledRejection is only reported once the microtask queue has
    // drained and the process has had a turn, so give it one.
    function settle(): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, 50));
    }

    beforeAll(() => {
      // betaACAO calls Config.get('API_URL_BASE').indexOf() on every request,
      // and config.ts has no default for it, so it has to be set before the
      // router is exercised at all.
      Config.set('API_URL_BASE', 'http://localhost:8081');
      return testingDBWithState([]).then(d => {
        db = d;
        const app = express();
        app.use(bodyParser.text({ type: '*/*', limit: '5mb' }));
        app.use(
          session({
            resave: false,
            saveUninitialized: false,
            secret: 'routes-test-secret',
          }),
        );
        const router = express.Router();
        installRoutes(db, router);
        app.use(router);

        server = http.createServer(app);
        return new Promise<void>((resolve, reject) =>
          server.listen(0, '127.0.0.1', () => {
            const address = server.address();
            if (address === null || typeof address === 'string') {
              return reject(new Error('Expected a TCP address'));
            }
            port = address.port;
            resolve();
          }),
        );
      });
    });

    afterAll(() => {
      return new Promise<void>(resolve => server.close(() => resolve())).then(
        () => db.sequelize.close(),
      );
    });

    beforeEach(() => {
      unhandled = [];
      process.on('unhandledRejection', record);
    });

    afterEach(() => {
      process.removeListener('unhandledRejection', record);
    });

    test('an unparseable body answers 400 and does not reject', () => {
      return post('/quest/feedback/feedback', '{')
        .then(res => {
          expect(res.status).toEqual(400);
          expect(res.body).toEqual('Error reading request.');
          return settle();
        })
        .then(() => expect(unhandled).toEqual([]));
    });

    test('an invalid feedback body answers 400 and does not reject', () => {
      return post(
        '/quest/feedback/feedback',
        JSON.stringify({ partition: 'expedition-public' }),
      )
        .then(res => {
          expect(res.status).toEqual(400);
          expect(res.body).toEqual('Invalid request.');
          return settle();
        })
        .then(() => expect(unhandled).toEqual([]));
    });

    test('an unknown feedback type answers 500 and does not reject', () => {
      return post(
        '/quest/feedback/not-a-real-type',
        JSON.stringify({ userid: 'user1' }),
      )
        .then(res => {
          expect(res.status).toEqual(500);
          expect(res.body).toEqual('Unknown feedback type: not-a-real-type');
          return settle();
        })
        .then(() => expect(unhandled).toEqual([]));
    });

    test('feedback about a quest that does not exist does not reject', () => {
      return post(
        '/quest/feedback/report_error',
        JSON.stringify({
          anonymous: false,
          difficulty: 'NORMAL',
          email: 'user1@example.com',
          partition: 'expedition-public',
          platform: 'web',
          players: 2,
          questid: 'no-such-quest',
          questversion: 1,
          text: 'something went wrong',
          userid: 'user1',
          version: '1.0.0',
        }),
      )
        .then(res => {
          // getQuest builds a Quest out of an empty row and throws; the
          // handler turns that into a 500 and then re-rejects.
          expect(res.status).toEqual(500);
          return settle();
        })
        .then(() => expect(unhandled).toEqual([]));
    });

    test('a rating for a quest that does not exist does not reject', () => {
      return post(
        '/quest/feedback/rating',
        JSON.stringify({
          anonymous: false,
          difficulty: 'NORMAL',
          email: 'user1@example.com',
          partition: 'expedition-public',
          platform: 'web',
          players: 2,
          questid: 'no-such-quest',
          questversion: 1,
          rating: 4,
          text: 'good',
          userid: 'user1',
          version: '1.0.0',
        }),
      )
        .then(res => {
          expect(res.status).toEqual(500);
          return settle();
        })
        .then(() => expect(unhandled).toEqual([]));
    });
  });

  // express-rate-limit 2 both blocked and delayed. v6 removed the delaying half
  // (it lives in express-slow-down now), v7 renamed `max` to `limit`, and v7
  // also started checking `trust proxy` against the `X-Forwarded-For` header.
  // None of that behaviour had a test, so the whole ladder is pinned here.
  //
  // /multiplayer/v1/new_session is limit 5, delayAfter 4, 3s per step, and its
  // limiter is mounted *before* requireAuth -- so an unauthenticated request
  // still goes through the limiter and answers 500, which makes the limiting
  // observable without a session.
  describe('rate limiting', () => {
    const SESSION_PATH = '/multiplayer/v1/new_session';
    const NOT_SIGNED_IN = 'You are not signed in.';
    const TOO_MANY_SESSIONS =
      'Creating sessions too frequently. Please wait 1 minute and then try again';

    interface LimitedResult extends Result {
      headers: http.IncomingHttpHeaders;
      ms: number;
    }

    let db: Database;
    let server: http.Server | undefined;
    let port: number;

    function post(
      path: string,
      extraHeaders: http.OutgoingHttpHeaders = {},
    ): Promise<LimitedResult> {
      const started = Date.now();
      const headers: http.OutgoingHttpHeaders = Object.assign(
        { 'content-length': '2', 'content-type': 'text/plain' },
        extraHeaders,
      );
      return new Promise((resolve, reject) => {
        const r = http.request(
          // Node's global agent keeps sockets alive, which would keep
          // server.close() from ever calling back.
          {
            agent: false,
            headers,
            host: '127.0.0.1',
            method: 'POST',
            path,
            port,
          },
          res => {
            let data = '';
            res.setEncoding('utf8');
            res.on('data', d => (data += d));
            res.on('end', () =>
              resolve({
                body: data,
                headers: res.headers,
                ms: Date.now() - started,
                status: res.statusCode || 0,
              }),
            );
          },
        );
        r.on('error', reject);
        r.end('{}');
      });
    }

    // A fresh app per test: installRoutes() builds the limiters, and each one
    // owns its own in-memory hit counter, so this is what isolates the tests
    // from each other.
    function listen(trustProxy: boolean): Promise<void> {
      const app = express();
      if (trustProxy) {
        // Exactly what services/api/src/index.ts does.
        app.set('trust proxy', 1);
      }
      app.use(bodyParser.text({ type: '*/*', limit: '5mb' }));
      app.use(
        session({
          resave: false,
          saveUninitialized: false,
          secret: 'rate-limit-test-secret',
        }),
      );
      const router = express.Router();
      installRoutes(db, router);
      app.use(router);

      server = http.createServer(app);
      return new Promise<void>((resolve, reject) =>
        (server as http.Server).listen(0, '127.0.0.1', () => {
          const address = (server as http.Server).address();
          if (address === null || typeof address === 'string') {
            return reject(new Error('Expected a TCP address'));
          }
          port = address.port;
          resolve();
        }),
      );
    }

    // Collects what express-rate-limit's own validation checks report; they go
    // to console.error rather than throwing, so an unset `trust proxy` is
    // otherwise silent.
    function captureConsoleErrors(): string[] {
      const captured: string[] = [];
      jest
        .spyOn(console, 'error')
        .mockImplementation((...args: unknown[]) =>
          captured.push(args.map(a => String(a)).join(' ')),
        );
      return captured;
    }

    beforeAll(() => {
      Config.set('API_URL_BASE', 'http://localhost:8081');
      return testingDBWithState([]).then(d => {
        db = d;
      });
    });

    afterAll(() => db.sequelize.close());

    afterEach(() => {
      const running = server;
      server = undefined;
      return running
        ? new Promise<void>(resolve => running.close(() => resolve()))
        : Promise.resolve();
    });

    test('lets requests under the limit through, slows the fifth, and refuses the sixth', async () => {
      await listen(true);

      const results: LimitedResult[] = [];
      for (let i = 0; i < 6; i++) {
        results.push(await post(SESSION_PATH));
      }

      // 500 is requireAuth turning away an unauthenticated caller; what matters
      // is that the request reached it at all.
      expect(results.map(r => r.status)).toEqual([
        500, 500, 500, 500, 500, 429,
      ]);
      results.slice(0, 5).forEach(r => expect(r.body).toEqual(NOT_SIGNED_IN));

      // express-slow-down only starts after delayAfter: 4 ...
      results.slice(0, 4).forEach(r => expect(r.ms).toBeLessThan(1000));
      // ... and then holds each request for (used - delayAfter) * 3000ms.
      expect(results[4].ms).toBeGreaterThanOrEqual(2900);

      // Past limit: 5 the limiter answers immediately -- express-rate-limit 2
      // also refused before applying any delay, and the split middleware keeps
      // that ordering because the limiter is mounted first.
      expect(results[5].ms).toBeLessThan(1000);
      expect(results[5].body).toEqual(TOO_MANY_SESSIONS);
      // v2 always sent the whole window (`ceil(windowMs / 1000)` = 60); v8
      // sends the time actually left in the window, so this is 60 minus
      // however long the ladder above took.
      const retryAfter = Number(results[5].headers['retry-after']);
      expect(retryAfter).toBeGreaterThan(50);
      expect(retryAfter).toBeLessThanOrEqual(60);

      // The legacy X-RateLimit-* headers v2 sent are still sent, and the
      // slow-down middleware does not overwrite them with its own delayAfter.
      expect(results[0].headers['x-ratelimit-limit']).toEqual('5');
      expect(results[0].headers['x-ratelimit-remaining']).toEqual('4');
      expect(results[1].headers['x-ratelimit-remaining']).toEqual('3');
    }, 30000);

    test('buckets clients by the last X-Forwarded-For entry, which a client cannot forge', async () => {
      const consoleErrors = captureConsoleErrors();
      await listen(true);

      const first = await post(SESSION_PATH, { 'x-forwarded-for': '1.1.1.1' });
      const second = await post(SESSION_PATH, { 'x-forwarded-for': '2.2.2.2' });

      // Separate clients, separate buckets.
      expect(first.headers['x-ratelimit-remaining']).toEqual('4');
      expect(second.headers['x-ratelimit-remaining']).toEqual('4');

      // Heroku's router *appends* the address it saw, so the last entry is the
      // trustworthy one. A client that prefixes its own value lands back in the
      // same bucket rather than escaping into a fresh one.
      const spoofed = await post(SESSION_PATH, {
        'x-forwarded-for': '9.9.9.9, 1.1.1.1',
      });
      expect(spoofed.headers['x-ratelimit-remaining']).toEqual('3');

      // And express-rate-limit 8 is satisfied with the configuration: no
      // startup throw, no ERR_ERL_UNEXPECTED_X_FORWARDED_FOR.
      expect(consoleErrors.filter(m => m.includes('ERR_ERL'))).toEqual([]);
    }, 30000);

    test('without trust proxy every client would share one bucket', async () => {
      const consoleErrors = captureConsoleErrors();
      await listen(false);

      const first = await post(SESSION_PATH, { 'x-forwarded-for': '1.1.1.1' });
      const second = await post(SESSION_PATH, { 'x-forwarded-for': '2.2.2.2' });

      // This is what the app did before this setting was added: req.ip is the
      // socket peer -- on Heroku, the router -- so two different clients count
      // against the same five-per-minute allowance. Kept as a test so that
      // removing `app.set('trust proxy', 1)` fails loudly instead of quietly
      // turning the publish limiter into a site-wide one.
      expect(first.headers['x-ratelimit-remaining']).toEqual('4');
      expect(second.headers['x-ratelimit-remaining']).toEqual('3');
      expect(
        consoleErrors.some(m =>
          m.includes('ERR_ERL_UNEXPECTED_X_FORWARDED_FOR'),
        ),
      ).toEqual(true);
    }, 30000);
  });
});

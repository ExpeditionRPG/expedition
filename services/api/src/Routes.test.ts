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
  test.skip('Rate limits session creation', () => {
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
      return new Promise<void>(resolve =>
        server.close(() => resolve()),
      ).then(() => db.sequelize.close());
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
});

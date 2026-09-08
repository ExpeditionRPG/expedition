import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as session from 'express-session';
import * as http from 'http';
import { Database } from '../models/Database';
import { testingDBWithState } from '../models/TestData';
import { installOAuthRoutes, oauth2Template } from './oauth2';

const Passport = require('passport');

// passport hands `authenticate` a clone of the strategy with these callbacks
// attached, so the strategy only ever sees them through `this`.
interface StrategyContext {
  success(user: object): void;
  fail(status: number): void;
}

interface GoogleIdToken {
  payload: {
    sub: string;
    name: string;
    email: string;
    picture: string;
  };
}

// What the next call to `Passport.authenticate('google-id-token')` should do.
// null means the token was rejected.
let nextToken: GoogleIdToken | null = null;

// oauth2.ts registers the real passport-google-id-token strategy under this
// name at import time; registering again replaces it. That leaves everything
// else in the route -- the body parse, passport's own logIn/session handling,
// the user upsert -- exactly as it runs in production, with only Google's
// token verification stubbed out.
const fakeGoogleStrategy = {
  name: 'google-id-token',
  authenticate(this: StrategyContext) {
    if (nextToken === null) {
      this.fail(401);
    } else {
      this.success(nextToken);
    }
  },
};

interface Result {
  status: number;
  cookie?: string;
  body: string;
}

function sessionCookie(res: http.IncomingMessage): string | undefined {
  const setCookie = res.headers['set-cookie'];
  if (!setCookie) {
    return undefined;
  }
  const sid = setCookie.find(c => c.startsWith('connect.sid='));
  return sid === undefined ? undefined : sid.split(';')[0];
}

describe('oauth2', () => {
  describe('auth router', () => {
    let db: Database;
    let server: http.Server;
    let port: number;

    function req(
      method: string,
      path: string,
      cookie?: string,
      body?: string,
    ): Promise<Result> {
      return new Promise((resolve, reject) => {
        const headers: { [k: string]: string } = {};
        if (cookie !== undefined) {
          headers.cookie = cookie;
        }
        if (body !== undefined) {
          headers['content-type'] = 'application/json';
          headers['content-length'] = String(Buffer.byteLength(body));
        }
        const r = http.request(
          { host: '127.0.0.1', port, method, path, headers },
          res => {
            let data = '';
            res.setEncoding('utf8');
            res.on('data', d => (data += d));
            res.on('end', () =>
              resolve({
                status: res.statusCode || 0,
                cookie: sessionCookie(res),
                body: data,
              }),
            );
          },
        );
        r.on('error', reject);
        r.end(body);
      });
    }

    function login(cookie?: string): Promise<Result> {
      return req(
        'POST',
        '/auth/google',
        cookie,
        JSON.stringify({ id_token: 'stub' }),
      );
    }

    beforeAll(() => {
      Passport.use('google-id-token', fakeGoogleStrategy);
      return testingDBWithState([]).then(d => {
        db = d;
        const app = express();
        app.use(bodyParser.text({ type: '*/*', limit: '5mb' }));
        app.use(
          session({
            resave: false,
            saveUninitialized: false,
            secret: 'oauth2-test-secret',
          }),
        );
        app.use(Passport.initialize());
        app.use(Passport.session());

        const router = express.Router();
        router.use(oauth2Template);
        installOAuthRoutes(db, router);
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
      nextToken = {
        payload: {
          sub: 'google-sub-1',
          name: 'Test Testerson',
          email: 'test@test.com',
          picture: 'http://example.com/pic.png',
        },
      };
    });

    test('successfully autenticates', () => {
      let cookie: string | undefined;
      return login()
        .then(res => {
          expect(res.status).toEqual(200);
          expect(JSON.parse(res.body).id).toEqual('google-sub-1');
          // Logging in must hand back a session cookie.
          expect(res.cookie).toBeDefined();
          cookie = res.cookie;
          return req('GET', '/auth/session', cookie);
        })
        .then(res => {
          // The display name/email/userid the route writes onto the session
          // *after* passport's logIn have to survive the login boundary --
          // passport >= 0.6 regenerates the session inside logIn, so anything
          // written before it would be gone by now.
          expect(res.status).toEqual(200);
          expect(JSON.parse(res.body).id).toEqual('google-sub-1');
        });
    });

    test('does not set auth state on auth failure', () => {
      nextToken = null;
      return login()
        .then(res => {
          expect(res.status).toEqual(401);
          return req('GET', '/auth/session', res.cookie);
        })
        .then(res => {
          expect(res.status).toEqual(401);
          expect(res.body).toEqual('You are not signed in.');
        });
    });

    test('regenerates the session on login', () => {
      // CVE-2022-25896: before passport 0.6 a session id chosen by an attacker
      // survived the victim's login. Logging in again over an existing session
      // must therefore issue a *different* id.
      let first: string | undefined;
      return login()
        .then(res => {
          first = res.cookie;
          expect(first).toBeDefined();
          return login(first);
        })
        .then(res => {
          expect(res.status).toEqual(200);
          expect(res.cookie).toBeDefined();
          expect(res.cookie).not.toEqual(first);
        });
    });

    test('logout clears the session', () => {
      let cookie: string | undefined;
      return login()
        .then(res => {
          cookie = res.cookie;
          return req('GET', '/auth/session', cookie);
        })
        .then(res => {
          expect(res.status).toEqual(200);
          return req('POST', '/auth/logout', cookie);
        })
        .then(res => {
          // passport >= 0.6 logout is asynchronous; the handler answers from
          // its callback rather than leaving the request hanging.
          expect(res.status).toEqual(200);
          return req('GET', '/auth/session', cookie);
        })
        .then(res => {
          expect(res.status).toEqual(401);
          expect(res.body).toEqual('You are not signed in.');
        });
    });
  });
});

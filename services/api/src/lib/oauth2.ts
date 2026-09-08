import * as express from 'express';
import { User } from 'shared/schema/Users';
import Config from '../config';
import { Database, UserInstance } from '../models/Database';
import { incrementLoginCount, subscribeToCreatorsList } from '../models/Users';
import { limitCors } from './cors';

// express-session types req.session as `Session & Partial<SessionData>`; the
// supported way to add fields is to augment SessionData. These five are
// everything this service stores on the session.
declare module 'express-session' {
  interface SessionData {
    oauth2return: string;
    userid: string;
    displayName: string;
    image: string;
    email: string;
  }
}

const GoogleTokenStrategy = require('passport-google-id-token');
const Passport = require('passport');

const Mailchimp = require('mailchimp-api-v3');
const mailchimp =
  Config.get('NODE_ENV') !== 'dev' && Config.get('MAILCHIMP_KEY')
    ? new Mailchimp(Config.get('MAILCHIMP_KEY'))
    : null;

// Configure the Google strategy for use by Passport.js.
// See https://www.npmjs.com/package/passport-google-id-token
Passport.use(
  new GoogleTokenStrategy(
    {
      clientID: Config.get('OAUTH2_CLIENT_ID').split(','), // allow for multiple keys
      clientSecret: Config.get('OAUTH2_CLIENT_SECRET'),
    },
    (parsedToken: any, googleId: any, done: any) => {
      return done(null, parsedToken, googleId);
    },
  ),
);

Passport.serializeUser((user: any, cb: any) => {
  cb(null, user);
});
Passport.deserializeUser((obj: any, cb: any) => {
  cb(null, obj);
});

// Middleware that requires the user to be logged in. If the user is not logged
// in, it will redirect the user to authorize the application and then return
// them to the original URL they requested.
export function required(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  if (!req.user) {
    if (req.session) {
      req.session.oauth2return = req.originalUrl;
    }
    return res.redirect('/auth/login');
  }
  next();
}

// Middleware that exposes the user's profile as well as login/logout URLs to
// any templates. These are available as `profile`, `login`, and `logout`.
export function oauth2Template(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  if (!req.session) {
    return next();
  }
  res.locals.id = req.session.userid;
  res.locals.name = req.session.displayName;
  res.locals.image = req.session.image;
  next();
}

export function installOAuthRoutes(db: Database, router: express.Router) {
  router.post(
    '/auth/google',
    limitCors,
    // Per passport-google-id-token, the post request to this route
    // should include a JSON object with the key id_token set to
    // the one the client received from Google (e.g. after
    // successful Google+ sign-in).
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      res.header('Access-Control-Allow-Origin', req.get('origin'));
      res.header('Access-Control-Allow-Credentials', 'true');

      try {
        req.body = JSON.parse(req.body);
      } catch (e) {
        return res.end('Could not parse request body.');
      }
      next();
    },
    Passport.authenticate('google-id-token'),
    // Post authentication, upsert a new user or load an existing user and increment its login count
    (req: express.Request, res: express.Response) => {
      if (!req.user) {
        // Was `res.end(401, 'Unauthorized')`, which express reads as
        // (chunk, encoding) -- it sent the body "401" with a bogus encoding and
        // left the status at 200, then fell through and dereferenced the
        // missing user.
        return res.status(401).end('Unauthorized');
      }
      const ru: any = req.user;
      const image = ru.payload.picture;
      const user = new User({
        name: ru.payload.name,
        email: ru.payload.email || '',
        // https://stackoverflow.com/questions/42833677/openid-connect-jwt-sub-or-email
        // https://openid.net/specs/openid-connect-core-1_0.html#IDToken
        id: ru.payload.sub,
      });

      if (req.session) {
        req.session.displayName = user.name || '';
        req.session.image = image || '';
        req.session.email = user.email || '';
        req.session.userid = user.id;
      }
      db.users
        .findOne({ where: { id: user.id } })
        .then((u: UserInstance | null) => {
          // Respond as soon as we get DB results
          if (u === null) {
            const jbody: any = { ...user, image };
            res.end(JSON.stringify(jbody));
            // Sequelize 6 returns native promises. Keep this write in the
            // chain so failures are handled and loginCount updates the new row.
            return db.users.upsert(user).then(() => {
              if ((req.get('host') || '').indexOf('quest') !== -1) {
                // New quest writer; auto-subscribe to creator newsletter
                return subscribeToCreatorsList(mailchimp, user.email);
              }
              // Otherwise, they'll send a separate subscribe request
            });
          } else {
            res.end(JSON.stringify(u));
            return null;
          }
        })
        .then(() => incrementLoginCount(db, user.id))
        .catch((error: Error) => {
          console.error(error);
          if (!res.headersSent) {
            res.status(500).end('Could not load user.');
          }
        });
    },
  );

  // Deletes the user's credentials and profile from the session.
  // This does not revoke any active tokens.
  router.post(
    '/auth/logout',
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      // passport >= 0.6 made logout asynchronous -- it drops the session's
      // passport entry, saves, and then regenerates the session (the other
      // half of the CVE-2022-25896 session-fixation fix). Calling it without
      // a callback now throws. Everything that used to be torn down by hand
      // below happens inside regenerate(), so the callback only has to
      // report failures and answer the request; the old handler answered
      // nothing at all and left the client hanging until it timed out.
      req.logout(err => {
        if (err) {
          return next(err);
        }
        res.status(200).end();
      });
    },
  );

  router.get(
    '/auth/session',
    limitCors,
    (req: express.Request, res: express.Response) => {
      if (!res.locals || !res.locals.id) {
        return res.status(401).end('You are not signed in.');
      }
      db.users
        .findOne({ where: { id: res.locals.id } })
        .then((u: UserInstance | null) => {
          if (u === null) {
            res.status(500).end('User not present in DB');
          } else {
            res.end(JSON.stringify(u));
          }
        })
        .catch((error: Error) => {
          console.error(error);
          res.status(500).end('Could not load user.');
        });
    },
  );
}

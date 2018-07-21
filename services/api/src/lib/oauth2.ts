import * as express from 'express';
import {User} from 'shared/schema/Users';
import Config from '../config';
import {Database, UserInstance} from '../models/Database';
import {
  incrementLoginCount,
  subscribeToCreatorsList
} from '../models/Users';

const GoogleTokenStrategy = require('passport-google-id-token');
const Passport = require('passport');

const Mailchimp = require('mailchimp-api-v3');
const mailchimp = (Config.get('NODE_ENV') !== 'dev' && Config.get('MAILCHIMP_KEY'))
  ? new Mailchimp(Config.get('MAILCHIMP_KEY'))
  : null;

// Configure the Google strategy for use by Passport.js.
//
// OAuth 2-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Google API on the user's behalf,
// along with the user's profile. The function must invoke `cb` with a user
// object, which will be set at `req.user` in route handlers after
// authentication.
Passport.use(new GoogleTokenStrategy({
    clientID: Config.get('OAUTH2_CLIENT_ID').split(','), // allow for multiple keys
    clientSecret: Config.get('OAUTH2_CLIENT_SECRET'),
  },
  (parsedToken: any, googleId: any, done: any) => {
    return done(null, googleId);
  }
));

Passport.serializeUser((user: any, cb: any) => {
  cb(null, user);
});
Passport.deserializeUser((obj: any, cb: any) => {
  cb(null, obj);
});
// [END setup]

// [START middleware]
// Middleware that requires the user to be logged in. If the user is not logged
// in, it will redirect the user to authorize the application and then return
// them to the original URL they requested.
export function required(req: express.Request, res: express.Response, next: express.NextFunction) {
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
export function oauth2Template(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.session) {
    return next();
  }

  if (req.session.passport) {
    res.locals.id = req.session.passport.user;
  }
  res.locals.name = req.session.displayName;
  res.locals.image = req.session.image;
  next();
}
// [END middleware]

export function installOAuthRoutes(db: Database, router: express.Router) {
  // Begins the authorization flow. The user will be redirected to Google where
  // they can authorize the application to have access to their basic profile
  // information. Upon approval the user is redirected to `/auth/google/callback`.
  // If the `return` query parameter is specified when sending a user to this URL
  // then they will be redirected to that URL when the flow is finished.
  // This also fetches their info from the DB and returns that (if available).
  // [START authorize]
  router.post('/auth/google', // LOGIN
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      // TODO: Lock down origin
      try {
        req.body = JSON.parse(req.body);
        if (req.session) {
          req.session.displayName = req.body.name || '';
          req.session.image = req.body.image || '';
          req.session.email = req.body.email || '';
        }
        next();
      } catch (e) {
        res.header('Access-Control-Allow-Origin', req.get('origin'));
        res.header('Access-Control-Allow-Credentials', 'true');
        return res.end('Could not parse request body.');
      }
    },
    Passport.authenticate('google-id-token'),
    (req: express.Request, res: express.Response) => {
      res.header('Access-Control-Allow-Origin', req.get('origin'));
      res.header('Access-Control-Allow-Credentials', 'true');
      if (!req.user) {
        res.end(401);
      }
      const user = new User({
        email: (req.body.email || '') as any as string,
        id: req.user as any as string,
        name: req.body.name,
      });

      db.users.findOne({where: {id: user.id}})
      .then((u: UserInstance|null) => {
        // Respond as soon as we get DB results
        if (u === null) {
          res.end(JSON.stringify(user));
          db.users.upsert(user);
          if ((req.get('host') || '').indexOf('quest') !== -1) {
            // New quest writer; auto-subscribe to creator newsletter
            return subscribeToCreatorsList(mailchimp, user.email);
          }
          // Otherwise, they'll send a separate subscribe request
        } else {
          res.end(JSON.stringify(u));
          return null;
        }
      })
      .then(() => incrementLoginCount(db, user.id))
      .catch(console.log);
    }
  );
  // [END authorize]

  // Deletes the user's credentials and profile from the session.
  // This does not revoke any active tokens.
  router.post('/auth/logout', // LOGOUT
    (req: express.Request, res: express.Response) => {
      req.logout();
      delete req.user;
      if (req.session) {
        delete req.session.image;
        delete req.session.displayName;
      }
    }
  );
}

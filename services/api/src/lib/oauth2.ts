import * as express from 'express';
import {User} from 'shared/schema/Users';
import Config from '../config';
import {Database, UserInstance} from '../models/Database';
import {
  incrementLoginCount,
  subscribeToCreatorsList
} from '../models/Users';
import { limitCors } from './cors';

const GoogleTokenStrategy = require('passport-google-id-token');
const Passport = require('passport');

const Mailchimp = require('mailchimp-api-v3');
const mailchimp = (Config.get('NODE_ENV') !== 'dev' && Config.get('MAILCHIMP_KEY'))
  ? new Mailchimp(Config.get('MAILCHIMP_KEY'))
  : null;

// Configure the Google strategy for use by Passport.js.
// See https://www.npmjs.com/package/passport-google-id-token
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

export function installOAuthRoutes(db: Database, router: express.Router) {
  const authRoute = [
    // First stage - extract request body and use it to set session metadata
    // for the user
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
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
    // Per passport-google-id-token, the post request to this route
    // should include a JSON object with the key id_token set to
    // the one the client received from Google (e.g. after
    // successful Google+ sign-in).
    Passport.authenticate('google-id-token'),
    // Post authentication, upsert a new user or load an existing user and increment its login count
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
    },
  ];
  router.get('/auth/google', limitCors, ...authRoute);
  router.post('/auth/google', limitCors, ...authRoute);

  // Deletes the user's credentials and profile from the session.
  // This does not revoke any active tokens.
  router.post('/auth/logout',
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

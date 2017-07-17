const Express = require('express');
const GoogleTokenStrategy = require('passport-google-id-token');
const Passport = require('passport');

const Config = require('../config');
const Users = require('../models/users');

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
  (parsedToken, googleId, done) => {
    return done(null, googleId);
  }
));

Passport.serializeUser((user, cb) => {
  cb(null, user);
});
Passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});
// [END setup]

const router = Express.Router();

// [START middleware]
// Middleware that requires the user to be logged in. If the user is not logged
// in, it will redirect the user to authorize the application and then return
// them to the original URL they requested.
function authRequired (req, res, next) {
  if (!req.user) {
    req.session.oauth2return = req.originalUrl;
    return res.redirect('/auth/login');
  }
  next();
}

// Middleware that exposes the user's profile as well as login/logout URLs to
// any templates. These are available as `profile`, `login`, and `logout`.
function addTemplateVariables (req, res, next) {
  res.locals.id = req.user;
  res.locals.name = req.session.displayName;
  res.locals.image = req.session.image;
  next();
}
// [END middleware]

// Begins the authorization flow. The user will be redirected to Google where
// they can authorize the application to have access to their basic profile
// information. Upon approval the user is redirected to `/auth/google/callback`.
// If the `return` query parameter is specified when sending a user to this URL
// then they will be redirected to that URL when the flow is finished.
// [START authorize]
router.post('/auth/google', // LOGIN
  (req, res, next) => {
    // TODO: Lock down origin
    try {
      req.body = JSON.parse(req.body);
      req.session.displayName = req.body.name;
      req.session.image = req.body.image;
      req.session.email = req.body.email;
      next();
    } catch (e) {
      res.header('Access-Control-Allow-Origin', req.get('origin'));
      res.header('Access-Control-Allow-Credentials', 'true');
      return res.end("Could not parse request body.");
    }
  },
  Passport.authenticate('google-id-token'),
  (req, res) => {
    res.header('Access-Control-Allow-Origin', req.get('origin'));
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.user) {
      res.end(req.user);
    } else {
      res.end(401);
    }
    const user = {id: req.user};
    if (req.body.email) { user.email = req.body.email; }
    if (req.body.name) { user.name = req.body.name; }
    Users.upsert(user, (err, result) => {
      if (err) {
        return console.log(err);
      }
    });
  }
);
// [END authorize]

// Deletes the user's credentials and profile from the session.
// This does not revoke any active tokens.
router.post('/auth/logout', // LOGOUT
  (req, res) => {
    req.logout();
    delete req.user;
    delete req.session.image;
    delete req.session.displayName;
  }
);

module.exports = {
  router: router,
  required: authRequired,
  template: addTemplateVariables,
};

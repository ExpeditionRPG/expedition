// Copyright 2015-2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var express = require('express');
var config = require('../config');

// [START setup]
var passport = require('passport');
var GoogleTokenStrategy = require('passport-google-id-token');

var callbackURL;
if (config.get('NODE_ENV') === 'production') {
  callbackURL = config.get('OAUTH2_CALLBACK');
} else {
  callbackURL = "http://localhost:8080/auth/google/callback";
}

// Configure the Google strategy for use by Passport.js.
//
// OAuth 2-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Google API on the user's behalf,
// along with the user's profile. The function must invoke `cb` with a user
// object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new GoogleTokenStrategy({
    clientID: config.get('OAUTH2_CLIENT_ID'),
  },
  function(parsedToken, googleId, done) {
    return done(null, googleId);
  }
));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});
// [END setup]

var router = express.Router();

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
router.post(
  // Login url
  '/auth/google',
  function(req, res, next) {
    try {
      req.body = JSON.parse(req.body);
      req.session.displayName = req.body.name;
      req.session.image = req.body.image;
    } catch (e) {
      res.header('Access-Control-Allow-Origin', config.get('CORS_URL'));
      res.header('Access-Control-Allow-Credentials', 'true');
      return res.end("Could not parse request body.");
    }
    next();
  },
  passport.authenticate('google-id-token'),
  function (req, res) {
    res.header('Access-Control-Allow-Origin', config.get('CORS_URL'));
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.user) {
      res.end(req.user);
    } else {
      res.end(401);
    }
  }
);
// [END authorize]

// Deletes the user's credentials and profile from the session.
// This does not revoke any active tokens.
router.post('/auth/logout', function (req, res) {
  req.logout();
  delete req.user;
  delete req.session.image;
  delete req.session.displayName;
});

module.exports = {
  router: router,
  required: authRequired,
  template: addTemplateVariables
};

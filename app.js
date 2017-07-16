const nr = require('newrelic');
const bodyParser = require('body-parser');
const express = require('express');
const passport = require('passport');
const path = require('path');
const session = require('express-session');
const url = require('url');

const config = require('./config');
const logging = require('./lib/logging');
const routes = require('./routes');

const app = express();

// Add the request logger before anything else so that it can
// accurately log requests.
app.use(logging.requestLogger);

app.use(bodyParser.text({ type:'*/*', extended: true, limit: '5mb' }));
// TODO: */* overrides all other body parsers. Eventually we'll want text to be the default
// but allow for urlencoding and json parsing too, which will require extensive QC + app testing.
// Issue / discussion: https://github.com/ExpeditionRPG/expedition-quest-creator/issues/228
// app.use(bodyParser.json({ type:'json/*' }));
// app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' })); // for parsing application/x-www-form-urlencoded

app.disable('etag');

const port = process.env.DOCKER_PORT2 || config.get('PORT');

const setupSession = function(app) {
  app.set('trust proxy', true);

  // Configure the session and session storage.
  const sessionConfig = {
    resave: false,
    saveUninitialized: false,
    secret: config.get('SESSION_SECRET'),
    signed: true
  };

  app.use(session(sessionConfig));

  // OAuth2
  app.use(passport.initialize());

  // TODO: Use postgres session storage (to prevent session loss due to restarting task)
  app.use(passport.session());
  app.use(require('./lib/oauth2').router);
};

const setupRoutes = function(app) {
  app.use(routes);
  app.use('/images', express.static('app/assets/images'));
  app.use(express.static('dist'));
};

const setupLogging = function(app) {
  // Add the error logger after all middleware and routes so that
  // it can log errors from the whole application. Any custom error
  // handlers should go after this.
  app.use(logging.errorLogger);

  // Basic 404 handler
  app.use(function (req, res) {
    res.status(404).send('Not Found');
  });

  // Basic error handler
  app.use(function (err, req, res, next) {
    /* jshint unused:false */
    // If our routes specified a specific response, then send that. Otherwise,
    // send a generic message so as not to leak anything.
    res.status(500).send(err.response || 'Something broke!');
  });
}

if (module === require.main) {
  setupSession(app);
  setupRoutes(app);
  setupLogging(app);

  var server = app.listen(port, function () {
    var port = server.address().port;
    console.log('App listening on port %s', port);
  });
}

module.exports = app;

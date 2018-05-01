import * as bodyParser from 'body-parser'
import * as passport from 'passport'
import * as session from 'express-session'
import * as express from 'express'
import * as http from 'http'

import config from './config'
import Routes, {setupWebsockets} from './Routes'
import * as oauth2 from './lib/oauth2'
import logging from './lib/logging'

const app = express();
const server = http.createServer(app);
setupWebsockets(server);

// Add the request logger before anything else so that it can
// accurately log requests.
app.use(logging.requestLogger);

app.use(bodyParser.text({ type:'*/*', extended: true, limit: '5mb' } as any));
// TODO: */* overrides all other body parsers. Eventually we'll want text to be the default
// but allow for urlencoding and json parsing too, which will require extensive QC + app testing.
// Issue / discussion: https://github.com/ExpeditionRPG/expedition-quest-creator/issues/228
// app.use(bodyParser.json({ type:'json/*' }));
// app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' })); // for parsing application/x-www-form-urlencoded

app.disable('etag');

const port = process.env.DOCKER_PORT2 || config.get('PORT');

const setupSession = function(app: any) {
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
  app.use(oauth2.router);
};

const setupRoutes = function(app: any) {
  app.use(Routes);
  app.use('/images', express.static('app/assets/images'));
  app.use(express.static('dist'));
};

const setupLogging = function(app: any) {
  // Add the error logger after all middleware and routes so that
  // it can log errors from the whole application. Any custom error
  // handlers should go after this.
  app.use(logging.errorLogger);

  // Basic 404 handler
  app.use(function(req: any, res: any) {
    res.status(404).send('Not Found');
  });

  // Basic error handler
  app.use(function(err: any, req: any, res: any, next: any) {
    // If our routes specified a specific response, then send that. Otherwise,
    // send a generic message so as not to leak anything.
    res.status(500).send(err.response || 'Something broke!');
  });
}

function init() {
  setupSession(app);
  setupRoutes(app);
  setupLogging(app);

  server.listen(port, () => {
    console.log('App listening on port %s', port);
  });

  if ((module as any).hot) {
    (module as any).hot.accept('./Routes', () => {
      console.log('should update');
    });
    (Routes as any) = require('./Routes');
  }
}
init();

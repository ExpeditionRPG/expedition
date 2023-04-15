import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as session from 'express-session';
import * as http from 'http';
import * as passport from 'passport';
import { Options as DBOptions, Sequelize } from 'sequelize';

// initalize sequelize with session store
const SessionStore = require('connect-session-sequelize')(session.Store);

import Config from './config';
import logging from './lib/logging';
import { AUTH_SESSION_TABLE, Database } from './models/Database';
import { setupWebsockets } from './multiplayer/Websockets';
import { installRoutes } from './Routes';

function setupDB() {
  if (!Config.get('DATABASE_URL')) {
    throw new Error('No DATABASE_URL defined in config');
  }
  return new Database(
    new Sequelize(Config.get('DATABASE_URL'), {
      dialectModule: require('pg'),
      dialectOptions: {
        ssl: Config.get('SEQUELIZE_SSL'),
      },
      logging: Config.get('SEQUELIZE_LOGGING') === 'true' ? console.log : false,
    } as DBOptions)
  );
}

function setupSession(db: Database, app: express.Express) {
  if (!Config.get('SESSION_SECRET')) {
    throw new Error('No SESSION_SECRET defined in config');
  }

  // Setup/sync sequelize session storage
  const store = new SessionStore({
    db: db.sequelize,
    table: AUTH_SESSION_TABLE,
  });

  // Configure the session and session storage.
  const sessionConfig = {
    resave: false,
    saveUninitialized: false,
    secret: Config.get('SESSION_SECRET'),
    signed: true,
    store,
  };

  app.use(session(sessionConfig));

  // OAuth2
  app.use(passport.initialize());

  // TODO: Use postgres session storage (to prevent session loss due to restarting task)
  app.use(passport.session());
}

function setupRoutes(db: Database, app: any) {
  const routes = express.Router();
  installRoutes(db, routes);

  app.use(routes);
  app.use('/images', express.static('app/assets/images'));
  app.use(express.static('dist'));
}

function setupLogging(app: any) {
  // Add the error logger after all middleware and routes so that
  // it can log errors from the whole application. Any custom error
  // handlers should go after this.
  app.use(logging.errorLogger);

  // Basic 404 handler
  app.use((req: any, res: any) => {
    res.status(404).send('Not Found');
  });

  // Basic error handler
  app.use((err: any, req: any, res: any, next: any) => {
    // If our routes specified a specific response, then send that. Otherwise,
    // send a generic message so as not to leak anything.
    res.status(500).send(err.response || 'Something broke!');
  });
}

function init() {
  const app = express();
  const server = http.createServer(app);

  // Add the request logger before anything else so that it can
  // accurately log requests.
  app.use(logging.requestLogger);

  // TODO: */* overrides all other body parsers. Eventually we'll want text to be the default
  // but allow for urlencoding and json parsing too, which will require extensive QC + app testing.
  // Issue / discussion: https://github.com/ExpeditionRPG/expedition-quest-creator/issues/228
  // app.use(bodyParser.json({ type:'json/*' }));
  // app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' })); // for parsing application/x-www-form-urlencoded
  app.use(
    bodyParser.text({ type: '*/*', extended: true, limit: '5mb' } as any)
  );

  // Prevent caching of resources
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag
  app.disable('etag');

  const db = setupDB();

  setupWebsockets(db, server);
  setupSession(db, app);
  setupRoutes(db, app);
  setupLogging(app);

  const port = process.env.DOCKER_PORT2 || Config.get('PORT');
  server.listen(port, () => {
    console.log('App listening on port %s', port);
  });
}
init();

const config: any = require('./config');

import bodyParser from 'body-parser'
import express from 'express'
import passport from 'passport'
import session from 'express-session'
import path from 'path'
import url from 'url'

//const nr: any = require('newrelic');
const logging: any = require('./lib/logging');
//const oauth2 = require('./lib/oauth2');
//const routes: any = require('./routes');

const app = express();

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

const port = process.env.DOCKER_PORT || config.get('PORT');
const port2 = process.env.DOCKER_PORT2 || 5000;

const setupSession = function(app: any) {
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
  //app.use(oauth2.router);
};

const setupRoutes = function(app: any) {
  //app.use(routes);

  if (process.env.NODE_ENV === 'dev') {
    // Set a catch-all route and proxy the request for static assets
    console.log('Proxying static requests to webpack');
    const proxy = require('proxy-middleware');
    app.use('/', proxy(url.parse('http://localhost:' + port2 + '/')));
  } else {
    // TODO: Serve files from dist/
    app.use('/assets', express.static('app/assets'));
    app.use(express.static('dist'));
  }
};

const setupLogging = function(app: any) {
  // Add the error logger after all middleware and routes so that
  // it can log errors from the whole application. Any custom error
  // handlers should go after this.
  app.use(logging.errorLogger);

  // Basic 404 handler
  app.use(function (req: any, res: any) {
    res.status(404).send('Not Found');
  });

  // Basic error handler
  app.use(function (err: any, req: any, res: any, next: any) {
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

  // Setup webpack-dev-server & proxy requests
  if (process.env.NODE_ENV === 'dev') {
    /*
    var webpack_config: any = require('./webpack.config');
    var webpack: any = require('webpack');
    //var WebpackDevServer: any = require('webpack-dev-server');
    var compiler = webpack(webpack_config);
    compiler.plugin('done', function() {
      console.log('DONE');
    });
    var conf: any = {
      publicPath: webpack_config.output.publicPath,
      contentBase: webpack_config.devServer.contentBase,
      hot: true,
      quiet: false,
      noInfo: false,
      historyApiFallback: true,
      watchOptions: null,
    };

    if (process.env.WATCH_POLL) { // if WATCH_POLL defined, revert watcher from inotify to polling
      conf.watchOptions = {
        poll: 2000,
        ignored: /node_modules|typings|dist|dll|\.git/,
      };
    }

    // Start the server
    //new WebpackDevServer(compiler, conf).listen(port2, 'localhost', function() {});
    console.log('Webpack listening on '+port2);
    */
  }

  app.listen(port, function () {
    console.log('App listening on port %s', port);
  });
}

module.exports = app;

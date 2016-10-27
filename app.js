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

if (process.env.CLOUD_DEBUG) {
  // Activate Google Cloud Trace and Debug when in production
  require('@google/cloud-trace').start();
  require('@google/cloud-debug');
}

var path = require('path');
var express = require('express');
var exphbs = require('express-handlebars');
var url = require('url');
var session = require('express-session');
//var MemcachedStore = require('connect-memcached')(session);
var passport = require('passport');
var config = require('./config');
var logging = require('./lib/logging');
var routes = require('./routes');
var bodyParser = require('body-parser')

var app = express();

// Add the request logger before anything else so that it can
// accurately log requests.
app.use(logging.requestLogger);

app.use(bodyParser.text({type:"*/*"}));

app.disable('etag');

// handlebars
var setupView = function(app) {
  app.engine('handlebars', exphbs({ defaultLayout: 'main'}));
  app.set('view engine', 'handlebars');
};

var setupSession = function(app) {
  app.set('trust proxy', true);

  // Configure the session and session storage.
  var sessionConfig = {
    resave: false,
    saveUninitialized: false,
    secret: config.get('SESSION_SECRET'),
    signed: true
  };

  // In production use the App Engine Memcache instance to store session data,
  // otherwise fallback to the default MemoryStore in development.
  if (config.get('MEMCACHED')) {
    var memAddr = process.env.MEMCACHE_PORT_11211_TCP_ADDR;
    var memPort = process.env.MEMCACHE_PORT_11211_TCP_PORT;
    if (!memAddr || !memPort) {
      sessionConfig.store = new MemcachedStore({
        hosts: [config.get('MEMCACHE_URL')]
      });
    } else {
      sessionConfig.store = new MemcachedStore({
        hosts: [memAddr + ":" + memPort]
      });
    }
  }

  app.use(session(sessionConfig));

  // OAuth2
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(require('./lib/oauth2').router);
};

var setupRoutes = function(app) {
  app.use(routes);

  if (process.env.NODE_ENV === 'dev') {
    // Set a catch-all route and proxy the request for static assets
    console.log("Proxying static requests to webpack");
    var proxy = require('proxy-middleware');
    app.use('/', proxy(url.parse('http://localhost:8081/')));
  } else {
    // TODO: Serve files from dist/
    app.use('/assets', express.static('app/assets'));
    app.use(express.static('dist'));
  }
};

var setupLogging = function(app) {
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
  setupView(app);
  setupSession(app);
  setupRoutes(app);
  setupLogging(app);

  // Setup webpack-dev-server & proxy requests
  if (process.env.NODE_ENV === 'dev') {
    var webpack_config = require('./webpack.config');
    var webpack = require('webpack');
    var WebpackDevServer = require('webpack-dev-server');
    var server = new WebpackDevServer(webpack(webpack_config), {
      publicPath: webpack_config.output.publicPath,
      contentBase: webpack_config.contentBase,
      hot: true,
      quiet: false,
      noInfo: false,
      historyApiFallback: true
    });

    // Start the server
    server.listen(8081, "localhost", function() {});
    console.log("Webpack listening on 8080");
  }

  var server = app.listen(config.get('PORT'), function () {
    var port = server.address().port;
    console.log('App listening on port %s', port);
  });
}

module.exports = app;

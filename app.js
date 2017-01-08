'use strict';

var webpack_config = require('./webpack.config');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

if (module === require.main) {
  var conf = {
    publicPath: webpack_config.output.publicPath,
    contentBase: webpack_config.contentBase,
    hot: true,
    quiet: false,
    noInfo: false,
    watchOptions: {
      poll: false,
    },
    historyApiFallback: true,
  };
  if (process.env.WATCH_POLL) { // if WATCH_POLL defined, revert watcher from inotify to polling
    conf.watchOptions = {
      aggregateTimeout: 300,
      poll: 1000,
    };
  }
  var server = new WebpackDevServer(webpack(webpack_config), conf);
  var port = process.env.DOCKER_PORT || 5000;

  // Start the server
  server.listen(port, "0.0.0.0", function() {});
  console.log("Webpack listening on " + port);
}

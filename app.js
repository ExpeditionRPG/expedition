'use strict';

var webpack_config = require('./webpack.config');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

if (module === require.main) {
  var server = new WebpackDevServer(webpack(webpack_config), {
    publicPath: webpack_config.output.publicPath,
    contentBase: webpack_config.contentBase,
    hot: true,
    quiet: false,
    noInfo: false,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    },
    historyApiFallback: true
  });

  var port = process.env.DOCKER_PORT || 5000;

  // Start the server
  server.listen(port, "0.0.0.0", function() {});
  console.log("Webpack listening on " + port);
}

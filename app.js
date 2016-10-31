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
    historyApiFallback: true
  });

  // Start the server
  server.listen(5000, "0.0.0.0", function() {});
  console.log("Webpack listening on 5000");
}

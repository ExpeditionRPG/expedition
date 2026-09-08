// This config is run to compile and export the production environment to the dist/ folder.
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Webpack = require('webpack');
const shared = require('./webpack.shared');

const options = {
  mode: 'production',
  devtool: 'source-map',
  resolve: {
    alias: require('./webpack.aliases'),
    extensions: ['.js', '.ts', '.tsx', '.json', '.txt'],
    // Replaces webpack 4's `node: {fs: 'empty', net: 'empty', tls: 'empty'}`
    // plus its implicit `stream` polyfill - see shared/webpack.shared.js.
    fallback: shared.resolve.fallback,
  },
  // No `entry`: every service defines one as an object, which replaces this
  // rather than concatenating. See shared/webpack.shared.js.
  output: {
    // This must be an absolute path, and thus must be defined per-service
    // path: 'dist',
    filename: '[name].js',
  },
  module: {
    rules: [
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
      ...shared.module.rules,
    ],
  },
  plugins: [
    // Webpack.optimize.AggressiveMergingPlugin was removed in webpack 5.
    new Webpack.DefinePlugin({
      // Default to beta for safety
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'dev'),
      'process.env.API_HOST': JSON.stringify(
        process.env.API_HOST || 'http://betaapi.expeditiongame.com',
      ),
      'process.env.OAUTH2_CLIENT_ID': JSON.stringify(
        process.env.OAUTH2_CLIENT_ID ||
          '545484140970-jq9jp7gdqdugil9qoapuualmkupigpdl.apps.googleusercontent.com',
      ),
    }),
    new CopyWebpackPlugin({ patterns: [{ from: 'src/index.html' }] }),
  ],
  optimization: {
    // `noEmitOnErrors: true` became `emitOnErrors: false` (the meaning inverted).
    emitOnErrors: false,
  },
  // ES6, matching the dev config. See shared/webpack.shared.js for why the
  // ES5 target was dropped.
  target: 'web',
};

module.exports = options;

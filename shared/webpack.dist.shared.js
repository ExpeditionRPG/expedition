// This config is run to compile and export the production environment to the dist/ folder.
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Webpack = require('webpack');
const shared = require('./webpack.shared');

const options = {
  mode: 'production',
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json', '.txt'],
  },
  entry: [
    'babel-polyfill',
    'whatwg-fetch',
    'promise-polyfill',
  ],
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
    new Webpack.optimize.AggressiveMergingPlugin(),
    new Webpack.DefinePlugin({
      // Default to beta for safety
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'dev'),
      'process.env.API_HOST': JSON.stringify(process.env.API_HOST || 'http://betaapi.expeditiongame.com'),
      'process.env.OAUTH2_CLIENT_ID': JSON.stringify(process.env.OAUTH2_CLIENT_ID || '545484140970-jq9jp7gdqdugil9qoapuualmkupigpdl.apps.googleusercontent.com'),
    }),
    new CopyWebpackPlugin([
      { from: 'src/index.html' },
    ]),
  ],
  optimization: {
    noEmitOnErrors: true,
  },
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
};

module.exports = options;

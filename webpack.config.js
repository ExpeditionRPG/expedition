'use strict'

var webpack = require('webpack')
var DashboardPlugin = require('webpack-dashboard/plugin');

var port = process.env.DOCKER_PORT || 8081;

var options = {
  cache: true,
  debug: true,
  entry: [
    'webpack-dev-server/client?http://localhost:' + port,
    'webpack/hot/only-dev-server',
    './app/react.tsx',
    './app/style.scss',
  ],
  resolve: {
    extensions: ['', '.js', '.ts', '.tsx', '.json']
  },
  contentBase: './app',
  output: {
    path: __dirname + '/dist/',
    publicPath: 'http://127.0.0.1:' + port +  '/',
    filename: 'bundle.js'
  },
  stats: {
    colors: true,
    reasons: true
  },
  module: {
    preLoaders: [
      { test: /\.js$/, loader: 'source-map-loader' },
      { test: /\.tsx$/, loader: 'tslint-loader', exclude: /node_modules/ }
    ],
    loaders: [
      { test: /\.(ttf|eot|svg|jpg|woff(2)?)(\?[a-z0-9=&.]+)?$/, loader : 'file-loader' },
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.tsx$/, loaders: ['react-hot-loader/webpack', 'awesome-typescript-loader'], exclude: /node_modules/ },
    ],
    postLoaders: [
      { test: /\.tsx$/, loaders: ['babel'], exclude: /node_modules/ },
    ],
  },
  tslint: {
    configuration: {
      rules: {
        quotemark: [true, 'single', 'jsx-double']
      }
    },
    emitErrors: true,
    failOnHint: true,
    tsConfigFile: 'tsconfig.json',
  },
  plugins: [
    new DashboardPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.CommonsChunkPlugin('init.js')
  ]
}

module.exports = options

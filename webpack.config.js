'use strict'

var webpack = require('webpack')
//var DashboardPlugin = require('webpack-dashboard/plugin');

var options = {
  cache: true,
  debug: true,
  entry: [
    'webpack-dev-server/client?http://localhost:8081',
    'webpack/hot/only-dev-server',
    './app/react.tsx',
  ],
  resolve: {
    extensions: ['', '.js', '.ts', '.tsx', '.json']
  },
  contentBase: "./app",
  output: {
    path: __dirname + '/dist/',
    publicPath: 'http://localhost:8081/',
    filename: 'bundle.js'
  },
  stats: {
    colors: true,
    reasons: true
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.tsx$/, loaders: ['react-hot', 'awesome-typescript-loader'], exclude: /node_modules/ },
    ],
    preLoaders: [
        // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
        { test: /\.js$/, loader: "source-map-loader" }
    ]
  },
  // recordsPath: __dirname + '/app/[hash].hot-update.json',
  plugins: [
    //new DashboardPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.CommonsChunkPlugin('init.js')
  ]
}

module.exports = options
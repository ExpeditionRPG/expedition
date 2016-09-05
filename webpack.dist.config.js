'use strict'

var webpack = require('webpack')

var options = {
  debug: false,
  entry: [
    './react.js',
  ],
  output: {
    path: __dirname + '/.tmp/assets/',
    filename: '[name].js'
  },
  module: {
    loaders: [
      { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' },
      { test: /\.jsx$/, loader: 'jsx?harmony', exclude: /node_modules/ }
    ]
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.CommonsChunkPlugin('init.js'),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ]
}

module.exports = options
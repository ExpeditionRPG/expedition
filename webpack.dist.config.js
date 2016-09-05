'use strict'

var webpack = require('webpack')

var options = {
  debug: false,
  entry: [
    './app/react.js',
  ],
  contentBase: "./app",
  output: {
    path: __dirname + '/dist/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "file" },
      { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.js$/, loaders: ['react-hot', 'jsx', 'babel'], exclude: /node_modules/ },
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
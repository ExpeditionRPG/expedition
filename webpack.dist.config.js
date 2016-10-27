'use strict'

var webpack = require('webpack')

var options = {
  debug: false,
  entry: [
    './app/react.tsx',
  ],
  contentBase: "./app",
  resolve: {
    extensions: ['', '.js', '.ts', '.tsx', '.json']
  },
  output: {
    path: __dirname + '/dist/',
    filename: 'bundle.js'
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
        { test: /\.js$/, loader: "source-map-loader" },
    ],
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.CommonsChunkPlugin('init.js'),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
      VERSION: JSON.stringify(require('./package.json').version)
    }),
  ],
};

module.exports = options;
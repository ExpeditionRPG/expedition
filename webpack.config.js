'use strict'

var webpack = require('webpack')

var options = {
  cache: true,
  debug: true,
  entry: [
    'webpack-dev-server/client?http://localhost:8081',
    'webpack/hot/only-dev-server',
    './app/react.tsx',
  ],
  resolve: {
    extensions: ['', '.js', '.ts', '.tsx']
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
      { test: /\.js$/, loaders: ['react-hot', 'jsx', 'babel'], exclude: /node_modules/ },
      { test: /\.tsx$/, loaders: ['react-hot', 'ts-loader?jsx=true'], exclude: /node_modules/ },
    ],
    preLoaders: [
        // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
        { test: /\.js$/, loader: "source-map-loader" }
    ]
  },
  // recordsPath: __dirname + '/app/[hash].hot-update.json',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.CommonsChunkPlugin('init.js')
  ]
}

module.exports = options
const Path = require('path');
const Webpack = require('webpack');

const PORT = process.env.DOCKER_PORT || 8081;

const options = {
  mode: 'production',
  cache: false,
  entry: {
    server: [
      './src/app.ts',
    ],
    batchRunner: [
      './src/batch.ts'
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.json', '.txt'],
  },
  output: {
    path: Path.join(__dirname, 'dist'),
    publicPath: 'http://localhost:' + PORT + '/',
    filename: '[name].js',
  },
  stats: 'minimal',
  target : 'node',
  node: {
    // Don't touch __dirname or __filename (so they work as normal when starting w/ nodejs)
    __dirname: false,
    __filename: false,
  },
  module: {
    rules: [
      // Explicitly don't lint as part of regular build to save on Heroku build memory
      // { test: /\.tsx$/, enforce: 'pre', loader: 'tslint-loader', options: {fix: true} },
      { test: /\.ts(x?)$/, loaders: ['awesome-typescript-loader'], exclude: [/\/node_modules\/.*/, /\/dist\/.*/] },
    ]
  },
  optimization: {
    minimize: false,
  },
  externals: {'pg': "require('pg')", 'sqlite3': "require('sqlite3')", 'tedious': "require('tedious')", 'pg-hstore': "require('pg-hstore')"},
  plugins: [
    new Webpack.DefinePlugin({
      VERSION: JSON.stringify(require('./package.json').version)
    }),
  ],
};

module.exports = options;

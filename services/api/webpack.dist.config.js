const Path = require('path');
const Webpack = require('webpack');

const PORT = process.env.DOCKER_PORT || 8081;

const options = {
  cache: true,
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
  stats: {
    colors: true,
    reasons: true,
  },
  target : 'node',
  node: {
    // Don't touch __dirname or __filename (so they work as normal when starting w/ nodejs)
    __dirname: false,
    __filename: false,
  },
  module: {
    rules: [
      { test: /\.tsx$/, enforce: 'pre', loader: 'tslint-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.ts(x?)$/, loaders: ['awesome-typescript-loader'], exclude: [/\/node_modules\/.*/, /\/dist\/.*/] },
    ]
  },
  externals: {'pg': "require('pg')", 'sqlite3': "require('sqlite3')", 'tedious': "require('tedious')", 'pg-hstore': "require('pg-hstore')"},
  plugins: [
    new Webpack.NoEmitOnErrorsPlugin(),
    new Webpack.DefinePlugin({
      VERSION: JSON.stringify(require('./package.json').version)
    }),
  ],
};

module.exports = options;

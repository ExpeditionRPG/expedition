// This does not use the shared webpack config
// Because it is an entirely different use case
// Most importantly - because it is deployed on Heroku
// which has memory constraints and does not benefit from minification, etc

const Path = require('path');
const Webpack = require('webpack');

const PORT = process.env.DOCKER_PORT || 8081;

const options = {
  mode: 'production',
  cache: false,
  entry: {
    server: [
      './src/index.ts',
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
      // Custom options to speed up single builds
      {
        test: /\.ts(x?)$/,
        loader: 'awesome-typescript-loader',
        options: {
          transpileOnly: true,
          useCache: false,
        },
        exclude: [/\/node_modules\/.*/, /\/dist\/.*/]
      },
    ]
  },
  optimization: {
    minimize: false,
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },
  externals: {'pg': "require('pg')", 'sqlite3': "require('sqlite3')", 'tedious': "require('tedious')", 'pg-hstore': "require('pg-hstore')"},
};

module.exports = options;

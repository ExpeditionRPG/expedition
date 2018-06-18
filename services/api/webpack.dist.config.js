const Path = require('path');
const Webpack = require('webpack');
const NodeExternals = require('webpack-node-externals');

const PORT = process.env.DOCKER_PORT || 8081;

const options = {
  cache: true,
  entry: {
    server: [
      './app/app.ts',
    ],
    batchRunner: [
      './app/batch.ts'
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
      { enforce: 'pre', test: /\.ts$/, loader: 'tslint-loader', exclude: /node_modules/ },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.ts(x?)$/, loaders: ['awesome-typescript-loader'], exclude: [/\/node_modules\/((?!expedition\-qdl).)*$/, /\/dist\/.*/] },
    ]
  },
  externals: [NodeExternals({whitelist: [/expedition/]})], // Do not bundle anything in node_modules.
  plugins: [
    new Webpack.HotModuleReplacementPlugin(),
    new Webpack.NoEmitOnErrorsPlugin(),
    new Webpack.DefinePlugin({
      VERSION: JSON.stringify(require('./package.json').version)
    }),
    new Webpack.LoaderOptionsPlugin({ // This MUST go last to ensure proper test config
      options: {
        tslint: {
          emitErrors: true,
          failOnHint: true,
          tsConfigFile: 'tsconfig.json',
        },
      },
    }),
  ],
};

module.exports = options;

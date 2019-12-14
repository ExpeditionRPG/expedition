const Path = require('path');
const Webpack = require('webpack');

const port = process.env.DOCKER_PORT || 8080;

const options = {
  cache: true,
  devServer: {
    contentBase: 'src',
    disableHostCheck: true,
    historyApiFallback: true,
    host: '0.0.0.0',
    hot: true,
    noInfo: false,
    port: port,
    publicPath: '/',
    quiet: false,
    watchContentBase: true,
    watchOptions: process.env.WATCH_POLL
      ? { aggregateTimeout: 300, poll: 1000 }
      : {},
  },
  devtool: 'source-map',
  entry: [
    'babel-polyfill',
    'whatwg-fetch',
    'promise-polyfill',
    'webpack-dev-server/client?http://localhost:' + port,
    'webpack/hot/only-dev-server',
  ],
  mode: 'development',
  module: {
    rules: [
      {
        enforce: 'pre',
        loader: 'tslint-loader',
        options: {
          fix: true,
          tsConfigFile: Path.resolve(__dirname, '../tsconfig.json'),
          // Explicitly disable extended type checking for dev workflow due to performance
          typeCheck: false,
        },
        test: /\.tsx$/,
      },
      {
        loader: 'file-loader',
        // disable filename hashing for infrequently changed static assets to enable preloading
        options: { name: 'images/[name].[ext]' },
        test: /\.(svg|png|gif|jpe?g)(\?[a-z0-9=&.]+)?$/,
      },
      {
        loader: 'file-loader',
        // disable filename hashing for infrequently changed static assets to enable preloading
        options: { name: 'fonts/[name].[ext]' },
        test: /\.(ttf|eot|woff(2)?)(\?[a-z0-9=&.]+)?$/,
      },
      {
        loaders: ['style-loader', 'css-loader', 'sass-loader'],
        test: /\.scss$/,
      },
      {
        exclude: /node_modules/,
        loaders: ['awesome-typescript-loader'],
        test: /\.tsx$/,
      },
    ],
  },
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
  output: {
    filename: '[name].js',
    publicPath: 'http://localhost:' + port + '/',
  },
  plugins: [
    new Webpack.DefinePlugin({
      // Default to beta for safety
      'process.env.API_HOST': JSON.stringify(
        process.env.API_HOST || 'https://betaapi.expeditiongame.com',
      ),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'dev'),
      'process.env.OAUTH2_CLIENT_ID': JSON.stringify(
        process.env.OAUTH2_CLIENT_ID ||
          '201136733984-q6bbbi2p01qfmknl97k0o2ag7utobm88.apps.googleusercontent.com',
      ),
    }),
    new Webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), // Don't import bloated Moment locales
    new Webpack.HotModuleReplacementPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json', '.txt'],
  },
  stats: {
    colors: true,
    reasons: true,
  },
};

module.exports = options;

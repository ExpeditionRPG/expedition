const Path = require('path');
const Webpack = require('webpack');

const aliases = require('./webpack.aliases');

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
        loader: 'ts-loader',
        options: {
          // Point at the monorepo tsconfig explicitly; ts-loader's own search
          // starts from the service directory and would find nothing.
          //
          // tsconfig.browser.json is tsconfig.json with `target: es5` +
          // `downlevelIteration`. Babel used to do this down-levelling for us
          // via awesome-typescript-loader's `useBabel`; see that file for why
          // the browser bundles cannot ship es6. services/api has its own
          // webpack config and stays on the root tsconfig (it runs on node).
          configFile: Path.resolve(__dirname, '../tsconfig.browser.json'),
          // `tsc --noEmit` (yarn typecheck / the CI Typecheck step) is the
          // authoritative type check for the repo. Re-running it inside every
          // one of the five bundles would quadruple build time for the same
          // diagnostics.
          transpileOnly: true,
        },
        test: /\.tsx?$/,
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
          '545484140970-jq9jp7gdqdugil9qoapuualmkupigpdl.apps.googleusercontent.com',
      ),
    }),
    new Webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), // Don't import bloated Moment locales
    new Webpack.HotModuleReplacementPlugin(),
  ],
  resolve: {
    alias: aliases,
    extensions: ['.js', '.ts', '.tsx', '.json', '.txt'],
  },
  stats: {
    colors: true,
    reasons: true,
  },
};

module.exports = options;

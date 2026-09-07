const Path = require('path');
const Webpack = require('webpack');

const aliases = require('./webpack.aliases');

const port = process.env.DOCKER_PORT || 8080;

const options = {
  cache: true,
  devServer: {
    // webpack-dev-server 4+ replaced `disableHostCheck` with `allowedHosts`.
    allowedHosts: 'all',
    // `quiet` / `noInfo` became `client.logging`.
    client: { logging: 'info' },
    // `devServer.publicPath` moved under `devMiddleware`.
    devMiddleware: { publicPath: '/' },
    historyApiFallback: true,
    host: '0.0.0.0',
    // Replaces the `webpack/hot/only-dev-server` entry + HotModuleReplacementPlugin;
    // the dev server adds both itself, and adding them by hand is now a hard error.
    hot: true,
    port: port,
    // `contentBase` / `watchContentBase` became `static.directory` / `static.watch`.
    // The dev server is always started from the service directory (`yarn start`
    // does `cd services/<name>`), so `src` is resolved against the cwd exactly as
    // the old relative `contentBase` was.
    static: {
      directory: Path.resolve(process.cwd(), 'src'),
      watch: true,
    },
  },
  devtool: 'source-map',
  entry: [
    'babel-polyfill',
    'whatwg-fetch',
    'promise-polyfill',
    // The `webpack-dev-server/client?...` and `webpack/hot/only-dev-server`
    // entries are gone: wds injects its own client, and `devServer.hot` above
    // covers hot module replacement.
  ],
  mode: 'development',
  module: {
    rules: [
      {
        // Was file-loader; webpack 5 asset modules replace it.
        // Disable filename hashing for infrequently changed static assets to
        // enable preloading. NB `[ext]` already carries the leading dot.
        generator: { filename: 'images/[name][ext]' },
        test: /\.(svg|png|gif|jpe?g)(\?[a-z0-9=&.]+)?$/,
        type: 'asset/resource',
      },
      {
        generator: { filename: 'fonts/[name][ext]' },
        test: /\.(ttf|eot|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        type: 'asset/resource',
      },
      {
        test: /\.scss$/,
        // `loaders` (plural) was removed in webpack 5.
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              // css-loader 1 left root-relative `url(/images/foo.jpg)` alone;
              // css-loader >= 4 tries to resolve it through webpack and fails.
              // Those paths are served from the site root at runtime (the files
              // are placed there by copy-webpack-plugin), so keep the old
              // behaviour rather than rewriting every stylesheet.
              url: { filter: url => !url.startsWith('/') },
            },
          },
          'sass-loader',
        ],
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
    // Don't import bloated Moment locales. The two-positional-argument form of
    // IgnorePlugin was removed in webpack 5.
    new Webpack.IgnorePlugin({
      contextRegExp: /moment$/,
      resourceRegExp: /^\.\/locale$/,
    }),
  ],
  resolve: {
    alias: aliases,
    extensions: ['.js', '.ts', '.tsx', '.json', '.txt'],
    // Webpack 5 dropped automatic node core polyfills, so `node: {fs: 'empty',
    // net: 'empty', tls: 'empty'}` is gone. `false` is the equivalent of the
    // old `'empty'`. Nothing in the browser sources imports a node builtin
    // directly; these are all reached through dependencies.
    //
    // `stream` is the one that has to keep working rather than be stubbed:
    // cheerio -> htmlparser2/WritableStream does `require('stream').Writable`
    // at module scope, so an empty stub would throw the moment Globals.tsx
    // loads. Webpack 4 silently supplied stream-browserify here; now we say so.
    fallback: {
      fs: false,
      net: false,
      stream: require.resolve('stream-browserify'),
      tls: false,
    },
  },
  stats: {
    colors: true,
    reasons: true,
  },
  // services/app ships through cordova-android@7 (Android 4.4 / Chrome 33), so
  // the bundle - including the runtime and chunk-loading code webpack injects -
  // must be ES5. Without the `es5` target webpack emits arrow functions and
  // `const` in its own runtime no matter what tsconfig.browser.json says.
  target: ['web', 'es5'],
  watchOptions: process.env.WATCH_POLL
    ? { aggregateTimeout: 300, poll: 1000 }
    : {},
};

module.exports = options;

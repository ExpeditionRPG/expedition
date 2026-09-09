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
    client: { logging: 'info', overlay: { errors: true, warnings: false } },
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
  // No `entry` here. All four services define one as an *object*, which
  // replaces rather than concatenates whatever this file sets, so the
  // `babel-polyfill` / `whatwg-fetch` / `promise-polyfill` array that used to
  // live here never reached a single bundle. Listing it was purely misleading:
  // the polyfills that do ship are imported by services/app/src/Init.tsx.
  //
  // The `webpack-dev-server/client?...` and `webpack/hot/only-dev-server`
  // entries are also gone: wds injects its own client, and `devServer.hot`
  // above covers hot module replacement.
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
          // This used to be tsconfig.browser.json, a copy of the root config
          // with `target: es5`. That file is gone -- see the `target` note at
          // the bottom of this file -- so the browser bundles now build from
          // the same root config as services/api.
          configFile: Path.resolve(__dirname, '../tsconfig.json'),
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
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env.EXPEDITION_ENV': JSON.stringify(
        process.env.NODE_ENV || 'dev',
      ),
      'process.env.OAUTH2_CLIENT_ID': JSON.stringify(
        process.env.OAUTH2_CLIENT_ID ||
          '545484140970-jq9jp7gdqdugil9qoapuualmkupigpdl.apps.googleusercontent.com',
      ),
      // shared/schema/Constants.tsx reads this, and that module is imported by
      // every browser service -- so it has to be defined for all of them, not
      // just the two that used to declare it in their own config. Webpack runs
      // with the service directory as cwd (as `devServer.static.directory`
      // above already assumes), so this picks up each service's own version.
      'process.env.VERSION': JSON.stringify(
        require(Path.resolve(process.cwd(), 'package.json')).version,
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
  // The browser bundles target ES6. This is a deliberate, owner-approved
  // compatibility drop, not an oversight: cordova-android@7 (Android 4.4 /
  // Chrome 33) and cordova-ios@4 (iOS 9) WebViews cannot parse ES6 and are no
  // longer supported.
  //
  // The `es5` target this replaces was never actually achieving its goal.
  // It down-levelled our own TypeScript and webpack's runtime glue, but
  // nothing transpiles node_modules (ts-loader excludes it and there is no
  // babel/swc loader), and `async`, `query-string`, `strict-uri-encode`,
  // `split-on-first`, `joi`, `semver` and `papaparse` all ship ES6. Parsing
  // the emitted bundles with acorn at `ecmaVersion: 5` failed on the original
  // webpack 4 + uglifyjs toolchain too, so those WebViews have been broken for
  // as long as those dependencies have been in the graph. Keeping the flag
  // only bought a false sense of coverage, at the cost of a larger, slower
  // bundle for every supported browser.
  target: 'web',
  watchOptions: process.env.WATCH_POLL
    ? { aggregateTimeout: 300, poll: 1000 }
    : {},
};

module.exports = options;

const Path = require('path');
const Webpack = require('webpack');

const port = process.env.DOCKER_PORT || 8080;

const options = {
  mode: 'development',
  devtool: 'source-map',
  cache: true,
  entry: [
    'babel-polyfill',
    'whatwg-fetch',
    'promise-polyfill',
    'webpack-dev-server/client?http://localhost:' + port,
    'webpack/hot/only-dev-server',
  ],
  output: {
    publicPath: 'http://localhost:' + port + '/',
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json', '.txt'],
  },
  stats: {
    colors: true,
    reasons: true,
  },
  module: {
    rules: [
      { test: /\.tsx$/, enforce: 'pre', loader: 'tslint-loader',
        options: {
          fix: true,
          typeCheck: false, // Explicitly disable extended type checking for dev workflow due to performance
          tsConfigFile: Path.resolve(__dirname, '../tsconfig.json'),
        },
      },
      { test: /\.(svg|png|gif|jpe?g)(\?[a-z0-9=&.]+)?$/, loader: 'file-loader',
        options: { name: 'images/[name].[ext]' }, // disable filename hashing for infrequently changed static assets to enable preloading
      },
      { test: /\.(ttf|eot|woff(2)?)(\?[a-z0-9=&.]+)?$/, loader: 'file-loader',
        options: { name: 'fonts/[name].[ext]' }, // disable filename hashing for infrequently changed static assets to enable preloading
      },
      { test: /\.scss$/, loaders: ['style-loader', 'css-loader', 'sass-loader'] },
      { test: /\.tsx$/, loaders: ['awesome-typescript-loader'], exclude: /node_modules/ },
    ]
  },
  plugins: [
    new Webpack.DefinePlugin({
      // Default to beta for safety
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'dev'),
      'process.env.API_HOST': JSON.stringify(process.env.API_HOST || 'http://betaapi.expeditiongame.com'),
      'process.env.OAUTH2_CLIENT_ID': JSON.stringify(process.env.OAUTH2_CLIENT_ID || '545484140970-jq9jp7gdqdugil9qoapuualmkupigpdl.apps.googleusercontent.com'),
    }),
    new Webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), // Don't import bloated Moment locales
    new Webpack.HotModuleReplacementPlugin(),
  ],
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
  devServer: {
    host: '0.0.0.0',
    contentBase: 'src',
    disableHostCheck: true,
    publicPath: '/',
    port: port,
    hot: true,
    quiet: false,
    noInfo: false,
    historyApiFallback: true,
    watchContentBase: true,
    watchOptions: ((process.env.WATCH_POLL) ? {aggregateTimeout: 300, poll: 1000} : {}),
  },
};

module.exports = options;

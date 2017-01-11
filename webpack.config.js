const webpack = require('webpack');
const DashboardPlugin = require('webpack-dashboard/plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const port = process.env.DOCKER_PORT || 8080;

const options = {
  cache: true,
  debug: true,
  entry: {
    bundle: [
      'webpack-dev-server/client?http://localhost:' + port,
      'webpack/hot/only-dev-server',
      './app/react.tsx',
      './app/style.scss',
    ],
  },
  resolve: {
    extensions: ['', '.js', '.ts', '.tsx', '.json']
  },
  contentBase: './app',
  output: {
    path: __dirname + '/dist/',
    publicPath: 'http://localhost:' + port + '/',
    filename: '[name].js'
  },
  stats: {
    colors: true,
    reasons: true,
  },
  module: {
    loaders: [
      { test: /\.(ttf|eot|svg|jpg|woff(2)?)(\?[a-z0-9=&.]+)?$/, loader : 'file-loader' },
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      // Specifically exclude building anything in node_modules, with the exception of the expedition-app lib we use for previewing quest code.
      { test: /\.tsx$/, loaders: ['awesome-typescript-loader'], exclude: /\/node_modules\/((?!expedition\-app).)*$/ },
    ],
    preLoaders: [
      { test: /\.js$/, loader: 'source-map-loader' }
    ]
  },
  plugins: [
    new DashboardPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.CommonsChunkPlugin('init.js'),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require('./package.json').version)
    }),
    new CopyWebpackPlugin([
      { from: 'node_modules/expedition-app/app/images', to: 'images'},
    ]),
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require("./dll/vendor-manifest.json")
    }),
  ],
};

module.exports = options

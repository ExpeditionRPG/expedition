const webpack = require('webpack');
const DashboardPlugin = require('webpack-dashboard/plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const LoaderOptionsPlugin = require("webpack/lib/LoaderOptionsPlugin");
var path = require('path');

const port = process.env.DOCKER_PORT || 8080;

const options = {
  cache: true,
  entry: {
    bundle: [
      'webpack-dev-server/client?http://localhost:' + port,
      'webpack/hot/only-dev-server',
      './app/react.tsx',
      './app/style.scss',
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json']
  },
  devServer: {
    contentBase: path.join(__dirname, 'app')
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: 'http://localhost:' + port + '/',
    filename: '[name].js'
  },
  stats: {
    colors: true,
    reasons: true,
  },
  module: {
    rules: [
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
      { enforce: 'pre', test: /\.tsx$/, loader: 'tslint-loader', exclude: /node_modules/ },
      { test: /\.(ttf|eot|svg|jpg|woff(2)?)(\?[a-z0-9=&.]+)?$/, loader : 'file-loader' },
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      // Specifically exclude building anything in node_modules, with the exception of the expedition-app lib we use for previewing quest code.
      { test: /\.tsx$/, loaders: ['react-hot-loader/webpack', 'awesome-typescript-loader'], exclude: /\/node_modules\/((?!expedition\-app).)*$/ },
      { enforce: 'post', test: /\.tsx$/, loaders: ['babel-loader'], exclude: /node_modules/ },
    ]
  },
  plugins: [
    new DashboardPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require('./package.json').version)
    }),
    new CopyWebpackPlugin([
      { from: 'node_modules/expedition-app/app/images', to: 'images'},
    ]),
    new webpack.LoaderOptionsPlugin({ // This MUST go last to ensure proper test config
      options: {
        tslint: {
          configuration: {
           rules: {
              quotemark: [true, 'single', 'jsx-double']
            }
          },
          emitErrors: true,
          failOnHint: true,
          tsConfigFile: 'tsconfig.json',
        },
      },
    }),
  ],
};

module.exports = options

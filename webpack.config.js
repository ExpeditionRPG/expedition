'use strict'

const webpack = require('webpack');
const DashboardPlugin = require('webpack-dashboard/plugin');
const path = require('path');
const port = process.env.DOCKER_PORT || 8082;

const options = {
  cache: true,
  entry: [
    'whatwg-fetch',
    'promise-polyfill',
    'webpack-dev-server/client?http://localhost:' + port,
    'webpack/hot/only-dev-server',
    './app/Main.tsx',
    './app/Style.scss',
  ],
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json'],
  },
  devServer: {
    host: "0.0.0.0",
    contentBase: path.join(__dirname, "app"),
    publicPath: '/',
    port: port,
    hot: true,
    quiet: false,
    noInfo: false,
    historyApiFallback: true
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  stats: {
    colors: true,
    reasons: true
  },
  module: {
    rules: [
      { enforce: 'pre', test: /\.tsx$/, loader: 'tslint-loader', exclude: /node_modules/ },
      { test: /\.(ttf|eot|svg|png|gif|jpe?g|woff(2)?)(\?[a-z0-9=&.]+)?$/, loader : 'file-loader' },
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.tsx$/, loaders: ['react-hot-loader/webpack', 'awesome-typescript-loader'], exclude: /node_modules/ },
      { enforce: 'post', test: /\.tsx$/, loaders: ['babel-loader'], exclude: /node_modules/ },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('dev'),
      },
    }),
    new DashboardPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.LoaderOptionsPlugin({ // This MUST go last to ensure proper test config
      options: {
        tslint: {
          configuration: {
           rules: {
              quotemark: [true, 'single', 'jsx-double'],
              curly: true,
              noUseBeforeDeclare: true,
              eofline: true,
              radix: true,
              switchDefault: true,
              tripleEquals: true,
              typeofCompare: true,
              useIsnan: true,
              indent: [true, "spaces"],
              // This can be uncommented occassionally to help clean up the codebase
              // But complains about enough false things that it's not worth leaving on
              // noUnusedVariable: true,
              noVarKeyword: true,
              preferConst: true,
              trailingComma: true,
            },
          },
          emitErrors: true,
          failOnHint: true,
          tsConfigFile: 'tsconfig.json',
        },
        babel: {
          presets: ["es2015"],
          cacheDirectory: true,
        },
      },
    }),
  ],
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
}

module.exports = options;

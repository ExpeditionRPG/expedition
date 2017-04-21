const Webpack = require('webpack');
const Path = require('path');
const DashboardPlugin = require('webpack-dashboard/plugin');

module.exports = {
  cache: true,
  entry: [
    './app/index.jsx',
    './app/style/index.scss',
  ],
  output: {
    path: Path.resolve('dist'),
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: Path.join(__dirname, 'app'),
    publicPath: '/',
    port: 8080,
    hot: true,
    quiet: false,
    noInfo: false,
    historyApiFallback: true,
    watchOptions: ((process.env.WATCH_POLL) ? {aggregateTimeout: 300, poll: 1000} : {}),
  },
  module: {
    rules: [
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ["es2015", "react"],
          },
        },
      }
    ],
  },
  plugins: [
    new DashboardPlugin(),
    new Webpack.HotModuleReplacementPlugin(),
    new Webpack.NoEmitOnErrorsPlugin(),
    new Webpack.LoaderOptionsPlugin({ // This MUST go last to ensure proper test config
      options: {
        babel: {
          presets: ["es2015"]
        },
      },
    }),
  ],
};

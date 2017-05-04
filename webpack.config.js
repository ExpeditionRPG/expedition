const Webpack = require('webpack');
const Path = require('path');
const DashboardPlugin = require('webpack-dashboard/plugin');

const port = process.env.DOCKER_PORT || 8080;

module.exports = {
  cache: true,
  entry: [
    'webpack-dev-server/client?http://localhost:' + port,
    'webpack/hot/only-dev-server',
    './app/React.tsx',
    './app/styles/index.scss',
  ],
  output: {
    path: Path.resolve('dist'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.js', '.tsx', '.json'],
  },
  devServer: {
    contentBase: Path.resolve('app'),
    publicPath: '/',
    port: port,
    hot: true,
    quiet: false,
    noInfo: false,
    historyApiFallback: true,
    watchOptions: ((process.env.WATCH_POLL) ? {aggregateTimeout: 300, poll: 1000} : {}),
  },
  module: {
    rules: [
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      { test: /\.(gif|png|jpe?g|svg)$/i, loaders: ['file-loader'] },
      { test: /\.tsx$/, loaders: ['awesome-typescript-loader'], exclude: /node_modules/ },
      {
        enforce: 'post',
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
  ],
};

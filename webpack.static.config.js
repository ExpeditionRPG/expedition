// Use this for building static error/maintenance pages.
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Path = require('path');
const Webpack = require('webpack');

const options = {
  entry: {
    bundle: [
      './app/style.scss',
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json', '.txt'],
  },
  output: {
    path: Path.join(__dirname,'static'),
    filename: '[name].js',
  },
  module: {
    loaders: [
      { test: /\.(ttf|eot|svg|png|gif|jpe?g|woff(2)?)(\?[a-z0-9=&.]+)?$/, loader : 'file-loader' },
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
    ],
  },
  plugins: [
    new Webpack.optimize.AggressiveMergingPlugin(),
    new Webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new CopyWebpackPlugin([
      { from: 'app/error.html' },
      { from: 'app/maintenance.html' },
      { from: 'app/assets', to: 'assets'},
      { from: 'node_modules/expedition-app/app/images', to: 'images'},
    ]),
  ],
};

module.exports = options;

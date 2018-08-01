const CopyWebpackPlugin = require('copy-webpack-plugin');
const Webpack = require('webpack');
const Merge = require('webpack-merge');
const shared = require('../../shared/webpack.dist.shared');
const dev = require('./webpack.config');

const options = {
  entry: dev.entry,
  plugins: [
    new CopyWebpackPlugin([
      { context: '../../shared/images', from: '**/*.+(jpg|svg|png)', to: './images' },
    ]),
  ],
};

module.exports = Merge(shared, options);

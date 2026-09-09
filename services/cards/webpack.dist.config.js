const CopyWebpackPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');
const shared = require('../../shared/webpack.dist.shared');
const dev = require('./webpack.config');

const options = {
  entry: dev.entry,
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          context: '../../shared/images',
          from: '**/*.+(jpg|svg|png)',
          to: './images',
        },
      ],
    }),
  ],
};

module.exports = merge(shared, options);

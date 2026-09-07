const CopyWebpackPlugin = require('copy-webpack-plugin');
const Webpack = require('webpack');
const { merge } = require('webpack-merge');
const shared = require('../../shared/webpack.shared');

const options = {
  entry: {
    bundle: ['./src/Init.tsx', './src/Style.scss'],
  },
  plugins: [
    new Webpack.DefinePlugin({
      'process.env.VERSION': JSON.stringify(require('./package.json').version),
    }),
    // copy-webpack-plugin 6 dropped `from: {glob}` and `flatten`; a glob string
    // plus a `[name][ext]` template in `to` is the replacement for both.
    new CopyWebpackPlugin({
      patterns: [
        { from: '../../shared/images/icons/*.svg', to: 'images/[name][ext]' },
        { from: '../../shared/images/art/*.png', to: 'images/[name][ext]' },
      ],
    }),
  ],
};

module.exports = merge(shared, options);

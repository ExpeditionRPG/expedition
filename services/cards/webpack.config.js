const CopyWebpackPlugin = require('copy-webpack-plugin');
const Webpack = require('webpack');
const Merge = require('webpack-merge');
const shared = require('../../shared/webpack.shared');

const options = {
  entry: {
    bundle: [
      './src/React.tsx',
      './src/styles/index.scss',
    ],
  },
  plugins: [
    new CopyWebpackPlugin([
      { context: '../../shared/images', from: '**/*.+(jpg|svg|png)', to: './images' },
    ]),
  ],
};

module.exports = Merge(shared, options);

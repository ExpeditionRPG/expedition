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
      { context: '../../node_modules/expedition-art', from: '**/*.+(jpg|svg|png)', to: 'expedition-art' },
    ]),
  ],
};

module.exports = Merge(shared, options);

const CopyWebpackPlugin = require('copy-webpack-plugin');
const Webpack = require('webpack');
const Merge = require('webpack-merge');
const shared = require('../../shared/webpack.shared');

const options = {
  entry: {
    bundle: [
      './src/React.tsx',
      './src/Style.scss',
    ],
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'src/assets' },
    ]),
  ],
};

module.exports = Merge(shared, options);

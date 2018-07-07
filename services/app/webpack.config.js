const CopyWebpackPlugin = require('copy-webpack-plugin');
const Webpack = require('webpack');
const Merge = require('webpack-merge');
const shared = require('../../shared/webpack.shared');

const options = {
  entry: {
    bundle: [
    './src/Init.tsx',
    './src/Style.scss',
    ],
  },
  plugins: [
    new Webpack.DefinePlugin({
      PACKAGE_VERSION: JSON.stringify(require('./package.json').version),
    }),
    new CopyWebpackPlugin([
      { from: { glob: '../../node_modules/expedition-art/icons/*.svg' }, flatten: true, to: './images' },
      { from: { glob: '../../node_modules/expedition-art/art/*.png' }, flatten: true, to: './images' },
    ]),
  ],
}

module.exports = Merge(shared, options);

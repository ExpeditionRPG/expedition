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
      'process.env.VERSION': JSON.stringify(require('./package.json').version),
    }),
    new CopyWebpackPlugin([
      { from: { glob: '../../shared/images/icons/*.svg' }, flatten: true, to: './images' },
      { from: { glob: '../../shared/images/art/*.png' }, flatten: true, to: './images' },
    ]),
  ],
}

module.exports = Merge(shared, options);

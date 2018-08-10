const CopyWebpackPlugin = require('copy-webpack-plugin');
const Webpack = require('webpack');
const Merge = require('webpack-merge');
const shared = require('../../shared/webpack.shared');

const options = {
  entry: {
    bundle: [
      './src/React.tsx',
      './src/Style.scss',
      '../app/src/Style.scss',
    ],
    playtest: [
      './src/playtest/PlaytestWorker.tsx',
    ],
  },
  output: {
    globalObject: "this", // Fixes web workers - https://github.com/webpack/webpack/issues/6642
  },
  plugins: [
    new Webpack.DefinePlugin({
      'process.env.VERSION': JSON.stringify(require('./package.json').version),
    }),
    new CopyWebpackPlugin([
      { from: 'src/index.html' },
      { from: 'src/assets' },
      { from: '../app/src/images', to: 'images' },
      { from: { glob: '../../shared/images/icons/*.svg' }, flatten: true, to: './images' },
      { from: { glob: '../../shared/images/art/*.png' }, flatten: true, to: './images' },
    ]),
  ],
};

module.exports = Merge(shared, options);

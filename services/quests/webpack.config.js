const CopyWebpackPlugin = require('copy-webpack-plugin');
const Webpack = require('webpack');
const Merge = require('webpack-merge');
const shared = require('../../shared/webpack.shared');

const entry = {
  bundle: ['./src/React.tsx', './src/Style.scss', '../app/src/Style.scss'],
  playtest: ['./src/playtest/PlaytestWorker.tsx'],
};

if (process.env.SKIP_RUNNER !== 'true') {
  entry.runner = ['./src/playtest/Runner.tsx'];
}

const options = {
  entry,
  output: {
    globalObject: 'this', // Fixes web workers - https://github.com/webpack/webpack/issues/6642
  },
  plugins: [
    new Webpack.DefinePlugin({
      'process.env.VERSION': JSON.stringify(require('./package.json').version),
    }),
    new CopyWebpackPlugin([
      { from: 'src/index.html' },
      { from: 'src/runner.html' },
      { from: 'src/assets' },
      { from: '../app/src/images', to: 'images' },
      {
        flatten: true,
        from: { glob: '../../shared/images/icons/*.svg' },
        to: './images',
      },
      {
        flatten: true,
        from: { glob: '../../shared/images/art/*.png' },
        to: './images',
      },
    ]),
  ],
};

module.exports = Merge(shared, options);

const CopyWebpackPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');
const shared = require('../../shared/webpack.shared');

const entry = {
  bundle: ['./src/React.tsx', './src/Style.scss', '../app/src/Style.scss'],
  playtest: ['./src/playtest/PlaytestWorker.tsx'],
  // Dev-server only. `src/runner.html` is the only page that loads runner.js,
  // and it is copied by this config's CopyWebpackPlugin below but NOT by
  // webpack.dist.config.js -- so a runner.js in dist has nothing to load it.
  // webpack.dist.config.js therefore drops this entry; see the note there.
  runner: ['./src/playtest/Runner.tsx'],
};

const options = {
  entry,
  output: {
    globalObject: 'this', // Fixes web workers - https://github.com/webpack/webpack/issues/6642
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/index.html' },
        { from: 'src/runner.html' },
        { from: 'src/assets' },
        { from: '../app/src/images', to: 'images' },
        // `flatten: true` + `from: {glob}` became a glob string with a
        // `[name][ext]` template in `to`.
        {
          from: '../../shared/images/icons/*.svg',
          to: 'images/[name][ext]',
        },
        {
          from: '../../shared/images/art/*.png',
          to: 'images/[name][ext]',
        },
      ],
    }),
  ],
};

module.exports = merge(shared, options);

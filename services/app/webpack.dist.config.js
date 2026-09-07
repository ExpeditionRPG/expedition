const CopyWebpackPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');
const Webpack = require('webpack');
const shared = require('../../shared/webpack.dist.shared');
const dev = require('./webpack.config');

const options = {
  entry: dev.entry,
  output: {
    path: __dirname + '/www/',
  },
  plugins: [
    new Webpack.DefinePlugin({
      'process.env.VERSION': JSON.stringify(require('./package.json').version),
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/robots.txt' },
        { from: 'src/manifest.json' },
        { from: 'src/images', to: 'images' },
        { from: 'src/quests', to: 'quests' },
        { context: 'src/audio', from: '**/*.mp3', to: 'audio' },
        { from: '../../shared/images/icons/*.svg', to: 'images/[name][ext]' },
        { from: '../../shared/images/art/*.png', to: 'images/[name][ext]' },
      ],
    }),
  ],
  optimization: {
    // uglifyjs-webpack-plugin peers on webpack ^4 and is gone. Webpack 5 runs
    // terser itself; `minimizeOptions.javascript` is where its options go, and
    // source maps come from `devtool: 'source-map'` rather than a plugin flag.
    minimize: true,
    minimizeOptions: {
      javascript: {
        compress: {
          keep_fnames: true, // Critical for multiplayer / remoteify!
          passes: 2,
        },
        mangle: {
          keep_fnames: true, // Critical for multiplayer / remoteify!
        },
      },
    },
  },
};

module.exports = merge(shared, options);

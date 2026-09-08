const CopyWebpackPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');
const shared = require('../../shared/webpack.dist.shared');
const dev = require('./webpack.config');
const app = require('../app/webpack.dist.config');

const options = {
  entry: dev.entry,
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        // Copy ops for dist folder (main app)
        { from: '../app/src/images', to: 'images' },
        { from: '../../shared/images/icons/*.svg', to: 'images/[name][ext]' },
        { from: '../../shared/images/art/*.png', to: 'images/[name][ext]' },
        { from: 'src/dictionaries', to: 'dictionaries' },
        { from: 'src/scripts', to: 'scripts' },

        // Copy ops for static folder (error/maintenance pages)
        { from: 'src/error.html' },
        { from: 'src/maintenance.html' },
      ],
    }),
  ],
  optimization: app.optimization,
};

module.exports = merge(shared, options);

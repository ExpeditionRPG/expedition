const CopyWebpackPlugin = require('copy-webpack-plugin');
const Webpack = require('webpack');
const Merge = require('webpack-merge');
const shared = require('../../shared/webpack.dist.shared');
const dev = require('./webpack.config');
const app = require('../app/webpack.dist.config');

const options = {
  entry: dev.entry,
  plugins: [
    new Webpack.DefinePlugin({
      PACKAGE_VERSION: JSON.stringify(require('./package.json').version),
    }),
    new CopyWebpackPlugin([
      // Copy ops for dist folder (main app)
      { from: '../app/src/images', to: 'images' },
      { from: { glob: '../../node_modules/expedition-art/icons/*.svg' }, flatten: true, to: 'images' },
      { from: { glob: '../../node_modules/expedition-art/art/*.png' }, flatten: true, to: 'images' },
      { from: 'src/dictionaries', to: 'dictionaries'},
      { from: 'src/scripts', to: 'scripts' },

      // Copy ops for static folder (error/maintenance pages)
      { from: 'src/error.html' },
      { from: 'src/maintenance.html' },
    ]),
  ],
  optimization: app.optimization,
};

module.exports = Merge(shared, options);

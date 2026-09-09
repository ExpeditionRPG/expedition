const CopyWebpackPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');
const shared = require('../../shared/webpack.dist.shared');
const dev = require('./webpack.config');

// TODO this does not export images to static/ for maintenance pages,
// but attempting to do so then breaks export to dist/
// Will be auto-fixed when we migrate all static pages to quests.expedition
// In the mean time, can manually copy images over when deploying static files

const options = {
  entry: dev.entry,
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/scripts', to: 'dist/scripts' },

        // Copy ops for static folder (error/maintenance pages)
        { from: 'src/error.html' },
        { from: 'src/maintenance.html' },
      ],
    }),
  ],
};

module.exports = merge(shared, options);

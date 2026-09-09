const CopyWebpackPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');
const shared = require('../../shared/webpack.dist.shared');
const dev = require('./webpack.config');
const app = require('../app/webpack.dist.config');

// The playtest `runner` chunk is dev-server only: `src/runner.html` is the sole
// page that loads runner.js, and it is not among the files copied into dist
// below. Shipping it produced a ~2.3 MB bundle on S3 that nothing could ever
// load. This used to be expressed as `SKIP_RUNNER=true` in the build script,
// which meant a POSIX-only env-var prefix that silently did nothing on Windows
// and was omitted entirely by deploy.sh -- so deploys shipped the dead chunk
// and local Windows builds disagreed with CI. Dropping it here instead makes it
// structural: no build can emit it, whatever the shell.
const { runner, ...distEntry } = dev.entry;

const options = {
  entry: distEntry,
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

// This config is run to compile and export the production environment to the dist/ folder.
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Path = require('path');
const Webpack = require('webpack');

const options = {
  mode: 'production',
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
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json', '.txt'],
  },
  output: {
    path: __dirname + '/dist/',
    filename: '[name].js',
  },
  module: {
    rules: [
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
      // TODO this does not export images to static/ for maintenance pages,
      // but attempting to do so then breaks export to dist/
      // Will be auto-fixed when we migrate all static pages to quests.expedition
      // In the mean time, can manually copy images over when deploying static files
      { test: /\.(ttf|eot|svg|png|gif|jpe?g|woff(2)?)(\?[a-z0-9=&.]+)?$/, loader : 'file-loader' },
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      { test: /\.tsx$/, loaders: ['awesome-typescript-loader'], exclude: /\/node_modules\/((?!expedition\-.*).)*$/ },
    ],
  },
  plugins: [
    new Webpack.optimize.AggressiveMergingPlugin(),
    new Webpack.DefinePlugin({
      'process.env': {
        // Default to beta for safety
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'dev'),
        'API_HOST': JSON.stringify(process.env.API_HOST || 'http://betaapi.expeditiongame.com'),
        'OAUTH2_CLIENT_ID': JSON.stringify(process.env.OAUTH2_CLIENT_ID || '545484140970-jq9jp7gdqdugil9qoapuualmkupigpdl.apps.googleusercontent.com'),
      }
    }),
    new CopyWebpackPlugin([
      // Copy ops for dist folder (main app)
      { from: 'src/index.html' },
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
};

module.exports = options;

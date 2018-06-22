// This config is run to compile and export the production environment to the dist/ folder.
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Path = require('path');
const Webpack = require('webpack');

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
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json', '.txt'],
  },
  output: {
    path: __dirname,
    filename: 'dist/[name].js',
  },
  module: {
    rules: [
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
      // TODO this does not export images to static/ for maintenance pages,
      // but attempting to do so then breaks export to dist/
      // Will be auto-fixed when we migrate all static pages to quests.expedition
      // In the mean time, can manually copy images over when deploying static files
      { test: /\.(ttf|eot|svg|png|gif|jpe?g|woff(2)?)(\?[a-z0-9=&.]+)?$/, loader : 'file-loader?outputPath=dist/' },
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.tsx$/, loaders: ['awesome-typescript-loader'], exclude: /\/node_modules\/((?!expedition\-.*).)*$/ },
      { enforce: 'post', test: /\.tsx$/, exclude: /node_modules\/((?!expedition\-.*).)*$/, use: [{
        loader: 'babel-loader',
        options: {
          presets: [["env", {
            "targets": {"browsers": [">5%", "last 2 years", "last 3 iOS versions", "chrome >= 39"]}
          }]],
        },
      }]},
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
      { from: 'src/index.html', to: 'dist' },
      { from: 'src/assets', to: 'dist' },
      { from: '../app/src/images', to: 'dist/images' },
      { from: { glob: '../../node_modules/expedition-art/icons/*.svg' }, flatten: true, to: './dist/images' },
      { from: { glob: '../../node_modules/expedition-art/art/*.png' }, flatten: true, to: './dist/images' },
      { from: 'src/dictionaries', to: 'dist/dictionaries'},
      { from: 'src/scripts', to: 'dist/scripts' },

      // Copy ops for static folder (error/maintenance pages)
      { from: 'src/error.html', to: 'dist' },
      { from: 'src/maintenance.html', to: 'dist' },
    ]),
  ],
};

module.exports = options;

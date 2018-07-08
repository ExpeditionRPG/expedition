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
    loaders: [
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
      // TODO this does not export images to static/ for maintenance pages,
      // but attempting to do so then breaks export to dist/
      // Will be auto-fixed when we migrate all static pages to quests.expedition
      // In the mean time, can manually copy images over when deploying static files
      { test: /\.(ttf|eot|svg|png|gif|jpe?g|woff(2)?)(\?[a-z0-9=&.]+)?$/, loader : 'file-loader?outputPath=dist/' },
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      { test: /\.tsx$/, loaders: ['awesome-typescript-loader'], exclude: /\/node_modules\/((?!expedition\-api).)*$/ },
    ],
  },
  plugins: [
    new Webpack.optimize.AggressiveMergingPlugin(),
    new Webpack.DefinePlugin({
      'process.env': {
        // Default to beta for safety
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'dev'),
        'API_HOST': JSON.stringify(process.env.API_HOST || 'http://betaapi.expeditiongame.com'),
      }
    }),
    new CopyWebpackPlugin([
      // Copy ops for dist folder (main app)
      { from: 'src/index.html', to: 'dist' },
      { from: 'src/assets', to: 'dist' },
      { from: 'src/scripts', to: 'dist/scripts' },

      // Copy ops for static folder (error/maintenance pages)
      { from: 'src/error.html', to: 'dist' },
      { from: 'src/maintenance.html', to: 'dist' },
    ]),
  ],
};

module.exports = options;

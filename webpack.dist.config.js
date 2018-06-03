const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const options = {
  entry: [
    'whatwg-fetch',
    'promise-polyfill',
    './app/Init.tsx',
    './app/Style.scss',
  ],
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json'],
  },
  output: {
    path: __dirname + '/www/',
    filename: 'bundle.js',
  },
  module: {
    rules: [
      { test: /\.(ttf|eot|svg|png|gif|jpe?g|woff(2)?)(\?[a-z0-9=&.]+)?$/, loader : 'file-loader',
        options: { name: '[name].[ext]' }, // disable filename hashing for infrequently changed static assets to enable preloading
      },
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.tsx$/, loaders: ['awesome-typescript-loader'], exclude: /node_modules\/((?!expedition\-qdl).)*$/ },
    ],
  },
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        // Default to beta for safety
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'dev'),
        'API_HOST': JSON.stringify(process.env.API_HOST || 'http://betaapi.expeditiongame.com'),
        'OAUTH2_CLIENT_ID': JSON.stringify(process.env.OAUTH2_CLIENT_ID || '545484140970-jq9jp7gdqdugil9qoapuualmkupigpdl.apps.googleusercontent.com'),
      },
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), // Don't import bloated Moment locales
    new webpack.optimize.AggressiveMergingPlugin(),
    new UglifyJsPlugin({
      sourceMap: true,
      uglifyOptions: {
        mangle: {
          keep_fnames: true, // Critical for multiplayer / remoteify!
        },
        compress: {
          keep_fnames: true, // Critical for multiplayer / remoteify!
        },
      },
    }),
    new CopyWebpackPlugin([
      { from: 'app/images', to: 'images'},
      { from: 'app/quests', to: 'quests'},
      { from: 'app/fonts', to: 'fonts'},
      { from: 'app/index.html' },
      { from: 'app/robots.txt' },
      { from: 'app/manifest.json' },
      { from: { glob: '**/*.mp3' }, context: 'app/audio', to: './audio' },
      { from: { glob: 'node_modules/expedition-art/icons/*.svg' }, flatten: true, to: './images' },
      { from: { glob: 'node_modules/expedition-art/art/*.png' }, flatten: true, to: './images' },
    ]),
  ],
};

module.exports = options;

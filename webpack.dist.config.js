const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const options = {
  entry: [
    'whatwg-fetch',
    'promise-polyfill',
    './app/Main.tsx',
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
    loaders: [
      { test: /\.(ttf|eot|svg|png|gif|jpe?g|woff(2)?)(\?[a-z0-9=&.]+)?$/, loader : 'file-loader' },
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.tsx$/, loaders: ['awesome-typescript-loader'], exclude: /node_modules\/((?!expedition\-qdl).)*$/ },
      { enforce: 'post', test: /\.tsx$/, exclude: /node_modules\/((?!expedition\-qdl).)*$/, use: [{
        loader: 'babel-loader',
        options: {
          presets: ["es2015"],
        },
      }]},
    ],
  },
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        // Default to beta for safety
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'dev'),
        'API_HOST': JSON.stringify(process.env.API_HOST || 'http://betaapi.expeditiongame.com'),
      },
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), // Don't import bloated Moment locales
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new UglifyJsPlugin({
      sourceMap: true,
      uglifyOptions: {
        mangle: {
          keep_fnames: true, // Critical for remote play / remoteify!
        },
        compress: {
          keep_fnames: true, // Critical for remote play / remoteify!
        },
      },
    }),
    new CopyWebpackPlugin([
      { from: 'app/images', to: 'images'},
      { from: 'app/quests', to: 'quests'},
      { from: 'app/scripts', to: 'scripts' },
      { from: 'app/fonts', to: 'fonts'},
      { from: 'app/index.html' },
      { from: 'app/manifest.json' },
      { from: { glob: '**/*.mp3' }, context: 'app/audio', to: './audio' },
      { from: { glob: 'node_modules/expedition-art/icons/*.svg' }, flatten: true, to: './images' },
      { from: { glob: 'node_modules/expedition-art/art/*.png' }, flatten: true, to: './images' },
    ]),
  ],
};

module.exports = options;

const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.(ttf|eot|svg|png|gif|jpe?g|woff(2)?)(\?[a-z0-9=&.]+)?$/, loader : 'file-loader' },
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.tsx$/, loaders: ['react-hot-loader/webpack', 'awesome-typescript-loader'], exclude: /node_modules\/((?!expedition\-qdl).)*$/ },
      { enforce: 'post', test: /\.tsx$/, loaders: ['babel-loader'], exclude: /node_modules\/((?!expedition\-qdl).)*$/ },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        // Default to beta for safety
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'dev'),
        'API_HOST': JSON.stringify(process.env.API_HOST || 'http://betaapi.expeditiongame.com'),
        'SERVICE_HOST': JSON.stringify(process.env.SERVICE_HOST || 'http://betaservice.expeditiongame.com'),
      },
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.UglifyJsPlugin({minimize: true, mangle: false}),
    new CopyWebpackPlugin([
      { from: 'app/images', to: 'images'},
      { from: 'app/audio', to: 'audio'},
      { from: 'app/quests', to: 'quests'},
      { from: 'app/scripts', to: 'scripts' },
      { from: 'app/fonts', to: 'fonts'},
      { from: 'app/index.html' },
      { from: 'app/manifest.json' },
      { from: { glob: 'node_modules/expedition-art/icons/*.svg' }, flatten: true, to: './images' },
    ]),
    new webpack.LoaderOptionsPlugin({
      options: {
        babel: {
          presets: ["es2015"]
        },
      },
    }),
  ],
};

module.exports = options;

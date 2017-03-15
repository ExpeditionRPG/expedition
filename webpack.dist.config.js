const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');

const options = {
  entry: {
    bundle: [
      './app/react.tsx',
      './app/style.scss',
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json', '.txt'],
  },
  output: {
    path: path.join(__dirname,'dist'),
    filename: '[name].js',
  },
  module: {
    loaders: [
      { enforce: 'pre', test: /\.js$/, loader: "source-map-loader" },
      { test: /\.(ttf|eot|svg|jpg|woff(2)?)(\?[a-z0-9=&.]+)?$/, loader : 'file-loader' },
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.tsx$/, loaders: ['awesome-typescript-loader'], exclude: /\/node_modules\/((?!expedition\-app).)*$/ },
    ],
  },
  plugins: [
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new CopyWebpackPlugin([
      { from: 'node_modules/expedition-app/app/images', to: 'images'},
      { from: 'app/dictionaries', to: 'dictionaries'},
    ]),
  ],
};

module.exports = options;

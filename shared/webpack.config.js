const Path = require('path');
const Webpack = require('webpack');
const child_process = require('child_process');

const port = process.env.DOCKER_PORT || 8080;

const options = {
  mode: 'development',
  cache: true,
  entry: {},
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json', '.txt'],
  },
  output: {
    path: Path.join(__dirname, 'dist'),
    publicPath: 'http://localhost:' + port + '/',
    filename: '[name].js',
  },
  stats: {
    colors: true,
    reasons: true,
  },
  module: {
    rules: [
      { test: /\.(ttf|eot|svg|png|gif|jpe?g|woff(2)?)(\?[a-z0-9=&.]+)?$/, loader : 'file-loader' },
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      { test: /\.tsx$/, loaders: ['awesome-typescript-loader'], exclude: /\/node_modules\/.*$/ },
    ]
  },
  plugins: [
    new Webpack.DefinePlugin({
      VERSION: JSON.stringify(require('./package.json').version)
    }),
  ],
};

module.exports = options;

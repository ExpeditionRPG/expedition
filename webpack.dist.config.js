// This config is run to compile and export the production environment to the dist/ folder.
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Path = require('path');
const Webpack = require('webpack');

const options = {
  entry: {
    bundle: [
      './app/React.tsx',
      './app/style.scss',
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json', '.txt'],
  },
  output: {
    path: Path.join(__dirname,'dist'),
    filename: '[name].js',
  },
  module: {
    loaders: [
      { enforce: 'pre', test: /\.js$/, loader: "source-map-loader" },
      { test: /\.(ttf|eot|svg|png|gif|jpe?g|woff(2)?)(\?[a-z0-9=&.]+)?$/, loader : 'file-loader' },
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.tsx$/, loaders: ['awesome-typescript-loader'], exclude: /\/node_modules\/((?!expedition\-app).)*$/ },
      { enforce: 'post', test: /\.tsx$/, loaders: ['babel-loader'], exclude: /\/node_modules\/((?!expedition\-app).)*$/ },
    ],
  },
  plugins: [
    new Webpack.optimize.AggressiveMergingPlugin(),
    new Webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new CopyWebpackPlugin([
      { from: 'app/index.html' },
      { from: 'node_modules/expedition-app/app/images', to: 'images'},
      { from: 'app/dictionaries', to: 'dictionaries'},
      { from: 'app/scripts', to: 'scripts'},
    ]),
    new Webpack.LoaderOptionsPlugin({ // This MUST go last to ensure proper test config
      options: {
        babel: {
          presets: ["es2015"],
          cacheDirectory: true,
        },
      },
    }),
  ],
};

module.exports = options;

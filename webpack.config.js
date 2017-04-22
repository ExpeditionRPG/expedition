const Webpack = require('webpack');
const Path = require('path');
const DashboardPlugin = require('webpack-dashboard/plugin');

module.exports = {
  cache: true,
  entry: [
    './app/React.jsx',
    './app/styles/index.scss',
  ],
  output: {
    path: Path.resolve('dist'),
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: Path.join(__dirname, 'app'),
    publicPath: '/',
    port: 8080,
  },
  module: {
    rules: [
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ["es2015", "react"],
          },
        },
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        loaders: [
          'file-loader',
          // {
          //   loader: 'image-webpack-loader',
          //   query: {
          //     progressive: true,
          //     optimizationLevel: 7,
          //     interlaced: false,
          //     pngquant: {
          //       quality: '65-90',
          //       speed: 4
          //     }
          //   }
          // }
        ]
      }
    ],
  },
  plugins: [
    new DashboardPlugin(),
    new Webpack.HotModuleReplacementPlugin(),
    new Webpack.NoEmitOnErrorsPlugin(),
    new Webpack.LoaderOptionsPlugin({ // This MUST go last to ensure proper test config
      options: {
        babel: {
          presets: ["es2015"]
        },
      },
    }),
  ],
};

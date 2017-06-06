const Webpack = require('webpack');
const Path = require('path');
const DashboardPlugin = require('webpack-dashboard/plugin');

const port = process.env.DOCKER_PORT || 8080;

module.exports = {
  cache: true,
  entry: [
    'webpack-dev-server/client?http://localhost:' + port,
    'webpack/hot/only-dev-server',
    './app/React.tsx',
    './app/styles/index.scss',
  ],
  output: {
    path: Path.resolve('dist'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.js', '.tsx', '.json'],
  },
  devServer: {
    contentBase: Path.resolve('app'),
    publicPath: '/',
    port: port,
    hot: true,
    quiet: false,
    noInfo: false,
    historyApiFallback: true,
    watchOptions: ((process.env.WATCH_POLL) ? {aggregateTimeout: 300, poll: 1000} : {}),
  },
  module: {
    rules: [
      { enforce: 'pre', test: /\.tsx$/, loader: 'tslint-loader', exclude: /node_modules/ },
      { test: /\.(ttf|eot|svg|png|gif|jpe?g|woff(2)?)(\?[a-z0-9=&.]+)?$/, loader : 'file-loader' },
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.tsx$/, loaders: ['react-hot-loader/webpack', 'awesome-typescript-loader'], exclude: /node_modules/ },
      { enforce: 'post', test: /\.tsx$/, loaders: ['babel-loader'], exclude: /node_modules/ },


      // { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      // { test: /\.(gif|png|jpe?g|svg)$/i, loaders: ['file-loader'] },
      // { test: /\.tsx$/, loaders: ['awesome-typescript-loader'], exclude: /node_modules/ },
      // {
      //   enforce: 'post',
      //   test: /\.jsx$/,
      //   exclude: /node_modules/,
      //   use: {
      //     loader: 'babel-loader',
      //     options: {
      //       presets: ["es2015", "react"],
      //     },
      //   },
      // }
    ],
  },
  plugins: [
    new DashboardPlugin(),
    new Webpack.HotModuleReplacementPlugin(),
    new Webpack.NoEmitOnErrorsPlugin(),
    new Webpack.LoaderOptionsPlugin({ // This MUST go last to ensure proper test config
      options: {
        tslint: {
          configuration: {
           rules: {
              quotemark: [true, 'single', 'jsx-double'],
              curly: true,
              noUseBeforeDeclare: true,
              eofline: true,
              radix: true,
              switchDefault: true,
              tripleEquals: true,
              typeofCompare: true,
              useIsnan: true,
              indent: [true, "spaces"],
              // We can add these when we feel like having more style enforcement
              //noUnusedVariables: true,
              //noVarKeyword: true,
              //preferConst: true,
              //trailingComma: true,
            },
          },
          emitErrors: true,
          failOnHint: true,
          tsConfigFile: 'tsconfig.json',
        },
        babel: {
          presets: ["es2015"],
          cacheDirectory: true,
        },
      },
    }),
  ],
};

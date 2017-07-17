const CopyWebpackPlugin = require('copy-webpack-plugin');
const DashboardPlugin = require('webpack-dashboard/plugin');
const Path = require('path');
const Webpack = require('webpack');
const NodeExternals = require('webpack-node-externals');

const PORT = process.env.DOCKER_PORT || 8080;

const options = {
  cache: true,
  entry: {
    server: [
      './app.ts',
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.json', '.txt'],
  },
  output: {
    path: Path.join(__dirname, 'dist'),
    publicPath: 'http://localhost:' + PORT + '/',
    filename: '[name].js',
  },
  stats: {
    colors: true,
    reasons: true,
  },
  node: {
    // Don't touch __dirname or __filename (so they work as normal when starting w/ nodejs)
    __dirname: false,
    __filename: false,
  },
  module: {
    rules: [
      { enforce: 'pre', test: /\.tsx$/, loader: 'tslint-loader', exclude: /\/node_modules\/.*/ },
      { test: /\.(ttf|eot|svg|png|gif|jpe?g|woff(2)?)(\?[a-z0-9=&.]+)?$/, loader : 'file-loader' },
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.ts$/, loaders: ['awesome-typescript-loader'], exclude: /\/node_modules\/.*/ },
      { enforce: 'post', test: /\.tsx$/, loaders: ['babel-loader'], exclude: /\/node_modules\/.*/ },
    ]
  },
  target: 'node',
  externals: [NodeExternals()], // Do not bundle anything in node_modules.
  plugins: [
    new DashboardPlugin(),
    new Webpack.HotModuleReplacementPlugin(),
    new Webpack.NoEmitOnErrorsPlugin(),
    new Webpack.DefinePlugin({
      VERSION: JSON.stringify(require('./package.json').version)
    }),
    new CopyWebpackPlugin([
      { from: 'app/index.html' },
      { from: 'node_modules/expedition-app/app/images', to: 'images'},
    ]),
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
            }
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

module.exports = options

const CopyWebpackPlugin = require('copy-webpack-plugin');
const Path = require('path');
const Webpack = require('webpack');

const port = process.env.DOCKER_PORT || 8080;

const options = {
  cache: true,
  entry: {
    bundle: [
      'webpack-dev-server/client?http://localhost:' + port,
      'webpack/hot/only-dev-server',
      './app/React.tsx',
      './app/Style.scss',
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json', '.txt'],
  },
  devServer: {
    host: '0.0.0.0',
    disableHostCheck: true,
    contentBase: Path.join(__dirname, 'app'),
    publicPath: '/',
    port: port,
    hot: true,
    quiet: false,
    noInfo: false,
    historyApiFallback: true,
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
      { enforce: 'pre', test: /\.tsx$/, loader: 'tslint-loader', exclude: /node_modules/ },
      { test: /\.(ttf|eot|svg|png|gif|jpe?g|woff(2)?)(\?[a-z0-9=&.]+)?$/, loader : 'file-loader' },
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.tsx$/, loaders: ['react-hot-loader/webpack', 'awesome-typescript-loader'], exclude: /\/node_modules\/((?!expedition\-api).)*$/ },
      { enforce: 'post', test: /\.tsx$/, loaders: ['babel-loader'], exclude: /\/node_modules\/((?!expedition\-api).)*$/ },
    ]
  },
  plugins: [
    new Webpack.HotModuleReplacementPlugin(),
    new Webpack.NoEmitOnErrorsPlugin(),
    new Webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'dev'),
        'API_HOST': JSON.stringify(process.env.API_HOST || 'http://betaapi.expeditiongame.com'),
      },
    }),
    new CopyWebpackPlugin([
      { from: 'app/index.html' },
      { from: 'app/assets' },
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
      },
    }),
  ],
};

module.exports = options

const Path = require('path');
const Webpack = require('webpack');
const child_process = require('child_process');

const port = process.env.DOCKER_PORT || 8080;

const options = {
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
      { enforce: 'pre', test: /\.tsx$/, loader: 'tslint-loader', exclude: /node_modules/ },
      { test: /\.(ttf|eot|svg|png|gif|jpe?g|woff(2)?)(\?[a-z0-9=&.]+)?$/, loader : 'file-loader' },
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      // Specifically exclude building anything in node_modules, with the exception of the expedition-app lib we use for previewing quest code.
      { test: /\.tsx$/, loaders: ['awesome-typescript-loader'], exclude: /\/node_modules\/((?!expedition\-app).)*$/ },
      { enforce: 'post', test: /\.tsx$/, loaders: ['babel-loader'], exclude: /\/node_modules\/((?!expedition\-app).)*$/ },
    ]
  },
  plugins: [
    new Webpack.HotModuleReplacementPlugin(),
    new Webpack.NoEmitOnErrorsPlugin(),
    new Webpack.DefinePlugin({
      VERSION: JSON.stringify(require('./package.json').version)
    }),
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
              noUnusedVariable: true,
              noVarKeyword: true,
              preferConst: true,
              trailingComma: true,
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

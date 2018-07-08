const CopyWebpackPlugin = require('copy-webpack-plugin');
const Path = require('path');
const Webpack = require('webpack');

const port = process.env.DOCKER_PORT || 8080;

const options = {
  mode: 'development',
  cache: true,
  entry: {
    bundle: [
      'webpack-dev-server/client?http://localhost:' + port,
      // HMR disabled for now, potentially fixable with
      // https://github.com/webpack/webpack/issues/6642
      // or
      // https://github.com/webpack-contrib/worker-loader
      // 'webpack/hot/only-dev-server',
      './src/React.tsx',
      './src/Style.scss',
      '../app/src/Style.scss',
    ],
    playtest: [
      './src/playtest/PlaytestWorker.tsx',
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json', '.txt'],
  },
  devServer: {
    host: '0.0.0.0',
    contentBase: Path.join(__dirname, 'src'),
    publicPath: '/',
    port: port,
    // hot: true,
    hot: false,
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
      { test: /\.tsx$/, enforce: 'pre', loader: 'tslint-loader', options: {fix: true} },
      { test: /\.(ttf|eot|svg|png|gif|jpe?g|woff(2)?)(\?[a-z0-9=&.]+)?$/, loader : 'file-loader' },
      { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
      { test: /\.tsx$/, loaders: ['react-hot-loader/webpack', 'awesome-typescript-loader'], exclude: /\/node_modules\/.*$/ },
    ]
  },
  plugins: [
    // new Webpack.HotModuleReplacementPlugin(),
    new Webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'dev'),
        'API_HOST': JSON.stringify(process.env.API_HOST || 'http://betaapi.expeditiongame.com'),
        'OAUTH2_CLIENT_ID': JSON.stringify(process.env.OAUTH2_CLIENT_ID || '545484140970-jq9jp7gdqdugil9qoapuualmkupigpdl.apps.googleusercontent.com'),
      },
    }),
    new CopyWebpackPlugin([
      { from: 'src/index.html' },
      { from: 'src/assets' },
      { from: '../app/src/images', to: 'images' },
      { from: { glob: '../../node_modules/expedition-art/icons/*.svg' }, flatten: true, to: './images' },
      { from: { glob: '../../node_modules/expedition-art/art/*.png' }, flatten: true, to: './images' },
    ]),
  ],
};

module.exports = options

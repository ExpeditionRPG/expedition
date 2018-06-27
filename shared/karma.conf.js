var webpackConfig = require('./webpack.config');
var webpack = require('webpack');

webpackConfig.module.rules.unshift({
  test: /isIterable/,
  loader: 'imports?Symbol=>false'
});

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      '../node_modules/babel-polyfill/dist/polyfill.js',
      { pattern: '**/*.test.tsx' },
    ],
    preprocessors: {
      '**/*.test.tsx': ['webpack'],
      '**/*.test.ts': ['webpack'],
    },
    globals: {
      utils: {},
    },
    webpack: {
      module: webpackConfig.module,
      resolve: webpackConfig.resolve,
      node: webpackConfig.node,
      // Pull in module-specific configs (esp. tslint)
      plugins: [webpackConfig.plugins[webpackConfig.plugins.length-1]],
      externals: {
        'react/addons': true,
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': true
      }
    },
    browserConsoleLogOptions: {
      level: 'log',
      format: '%b %T: %m',
      terminal: true,
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['NoSandboxChromeHeadless'],
    customLaunchers: {
      NoSandboxChromeHeadless: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    singleRun: false,
    concurrency: Infinity
  })
}

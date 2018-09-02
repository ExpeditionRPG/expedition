const webpackConfig = require('./webpack.config');

webpackConfig.module.rules.unshift({
  test: /isIterable/,
  loader: 'imports?Symbol=>false'
});

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      // Set watched=false here as karma-webpack does the watching under the hood.
      { pattern: 'src/**/*.test.tsx', watched:false},
    ],
    preprocessors: {
      'src/**/*.test.tsx': ['webpack'],
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
      },
    },
    webpackMiddleware: {
      watchOptions: {
        ignored: [/\/\./, 'node_modules'],
        poll: 1000,
      }
    },
    browserConsoleLogOptions: {
      level: 'log',
      format: '%b %T: %m',
      terminal: true,
    },
    reporters: ['progress'],
    port: 8081,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['NoSandboxChromeHeadless'],
    customLaunchers: {
      NoSandboxChromeHeadless: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    singleRun: false,
    concurrency: Infinity,
    browserNoActivityTimeout: 60000,
    browserDisconnectTimeout: 30000,
    captureTimeout: 60000,
    browserDisconnectTolerance: 5,
  });
}

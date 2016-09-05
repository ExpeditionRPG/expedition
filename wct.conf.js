var path = require('path');

var config = {
  plugins: {
    local: {
      browsers: ['chrome'],
    }
  },
  suites: ['app/test'],
  webserver: {
    pathMappings: [],
  },
};

var mapping = {};
var rootPath = (__dirname).split(path.sep).slice(-1)[0];

mapping['/components/' + rootPath  +
'/app/bower_components'] = 'bower_components';

config.webserver.pathMappings.push(mapping);

module.exports = config;

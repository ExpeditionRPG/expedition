const fs = require('fs');
const expect = require('expect');

function walkDir(root) {
  const stat = fs.statSync(root);
  if (stat.isDirectory()) {
      const dirs = fs.readdirSync(root).filter(item => !item.startsWith('.'));
      let results = dirs.map(sub => walkDir(`${root}/${sub}`));
      return [].concat(...results);
  } else {
      return [root];
  }
}

describe('Dependencies', () => {
  it('are actually used', () => {
    const package = require('./package.json');
    const packageUsage = JSON.stringify(package.scripts) + JSON.stringify(package.cordova);
    const WHITELIST = [
      // Needed to build app
      'cordova-android',
      'cordova-ios',
      'es6-promise-plugin',

      // Needed for compilation
      '@types/.*',
      'typescript',
      'webpack-cli',
      'node-sass',
      'babel-preset-env',
      'babel-core',
      'babel-loader',

      // Needed for tests
      'babel-jest',
      'pre-push',
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'karma-webpack',
      'enzyme-adapter-react-16',
      'react-test-renderer',
      'sqlite3',

      // TO DO AUDIT
      'sinon',
      'sinon-express-mock',
      'jasmine-expect',
      'karma-chrome-launcher',
      'karma-es6-shim',
      'karma-sourcemap-loader',
      'mocha-loader',
      'supertest',
      'ts-node',
      'mocha-webpack',
      'babel-plugin-module-resolver',
      'babel-plugin-module-resolver-zavatta',
    ];

    let depstrs = Object.keys(package.dependencies || {});
    Array.prototype.push.apply(depstrs, Object.keys(package.devDependencies || {}));
    depstrs = depstrs.filter((dep) => {
      for (let w of WHITELIST) {
        if (dep.match(w)) {
          return false;
        }
      }
      return true;
    });

    const unused_deps = [];
    const files = [
      ...walkDir('./services').filter((path) => path.match(/.*\.(tsx|js)/)),
      ...walkDir('./shared').filter((path) => path.match(/.*\.(tsx|js)/))];
    for (let dep of depstrs) {
      let found = false;
      for (let path of files) {
        if (fs.readFileSync(path, 'utf8').match("[/\"\'!]" + dep)) {
          found = true;
          break;
        }
      }

      // Check for use in package.json sections
      if (!found && packageUsage.indexOf(dep) !== -1) {
        found = true;
      }

      if (!found) {
        unused_deps.push(dep);
      }
    }
    console.log('Found ' + depstrs.length + ' deps (' + unused_deps.length + ' unused)');
    expect(unused_deps).toEqual([]);
  }).timeout(10000);
})

const fs = require('fs');
const expect = require('expect');

const FILES = [
  ...walkDir('./services').filter((path) => path.match(/.*\.(tsx|ts|js)/)),
  ...walkDir('./shared').filter((path) => path.match(/.*\.(tsx|ts|js)/)),
];

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

      // Needed for tests
      'babel-jest',
      'pre-commit',
      'pre-push',
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'karma-webpack',
      'enzyme-adapter-react-16',
      'react-test-renderer',
      'sqlite3',
      'jasmine-core',

      // Needed for storage layer
      'pg',

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
    for (let dep of depstrs) {
      let found = false;
      for (let path of FILES) {
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
});

describe('Typescript files', () => {
  it('are always in pairs of *.tsx and *.test.tsx', () => {
    const WHITELIST = [
      'reducers/',
      'Constants$',
      'Container$',
      'TestData$',
      'Theme$',
      '/app/platforms/',
      '/app/plugins/',
      '/cards/src/themes/',
      '/quests/errors', // TODO move these to common code?
    ];
    const WHITELIST_REGEX = new RegExp(WHITELIST.join('|'));

    let count = {};
    for (let f of FILES) {
      if (['tsx', 'ts'].indexOf(f.split('.').pop()) !== -1) {
        const base = f.split('.')[1]; // "./app/..."
        count[base] = (count[base] || 0) + 1;
      }
    }

    let violations = [];
    for (let k of Object.keys(count)) {
      if (count[k] !== 2 && !WHITELIST_REGEX.test(k)) {
        violations.push(k);
      }
    }
    expect(violations).toEqual([]);
  });
});

const fs = require('fs');
const expect = require('expect');

const path = require('path');

const FILES = [
  ...walkDir(path.join(__dirname, '../services')).filter((path) => path.match(/.*\.(tsx|ts|js)/)),
  ...walkDir(path.join(__dirname, '../shared')).filter((path) => path.match(/.*\.(tsx|ts|js)/)),
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
  test('are actually used', () => {
    const packageJSON = require('../package.json');
    const packageUsage = JSON.stringify(packageJSON.scripts) + JSON.stringify(packageJSON.cordova);
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
      'react-hot-loader',
      'babel-plugin-module-resolver-zavatta',
      'babel-plugin-transform-runtime',

      // Needed for tests
      'babel-jest',
      'pre-commit',
      'pre-push',
      'karma-jasmine',
      'karma-webpack',
      'enzyme-adapter-react-16',
      'react-test-renderer',
      'sqlite3',
      'jasmine-core',
      'jest-localstorage-mock',

      // Needed for storage layer
      'pg',

      // TO DO AUDIT
      'sinon',
      'sinon-express-mock',
      'jasmine-expect',
      'karma-chrome-launcher',
      'karma-es6-shim',
      'karma-sourcemap-loader',
    ];

    let depstrs = Object.keys(packageJSON.dependencies || {});
    Array.prototype.push.apply(depstrs, Object.keys(packageJSON.devDependencies || {}));
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

      // Check for use in packageJSON.json sections
      if (!found && packageUsage.indexOf(dep) !== -1) {
        found = true;
      }

      if (!found) {
        unused_deps.push(dep);
      }
    }
    console.log('Found ' + depstrs.length + ' deps (' + unused_deps.length + ' unused)');
    expect(unused_deps).toEqual([]);
  }, 10000);
});

describe('Typescript files', () => {
  test('are always in pairs of *.tsx and *.test.tsx', () => {
    const WHITELIST = [
      'reducers/',
      'Constants$',
      'Container$',
      'TestData$',
      'Theme$',
      '/app/platforms/',
      '/app/plugins/',
      '/cards/src/themes/',
      '/quests/src/dictionaries',
      '/quests/errors', // TODO move these to common code?
    ];
    const WHITELIST_REGEX = new RegExp(WHITELIST.join('|'));

    let count = {};
    for (let f of FILES) {
      const name = f.split('.');
      const extension = name.pop();
      if (['tsx', 'ts'].indexOf(extension) !== -1) {
        const base = (name[0].split('/expedition/')[1] || name[0]).replace('.test', ''); // filename relative to repo
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

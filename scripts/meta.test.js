const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');

// Config that lives at the repo root but still "uses" dependencies. Without
// these, anything referenced only by the test runner config reads as unused.
const ROOT_CONFIG_FILES = [
  'package.json',
  'jest.config.js',
  'jest.setup.js',
  'tsconfig.json',
  'tslint.json',
  '.lintstagedrc.json',
  '.husky/pre-commit',
  '.github/workflows/ci.yml',
];

// Generated or vendored output, per .gitignore. `www` in particular is where
// services/app emits its bundle, so without it these tests fail on any
// checkout where `yarn build-all` has been run.
const IGNORED_DIRS = [
  'dist',
  'node_modules',
  'www',
  'coverage',
  'platforms',
  'plugins',
];

const FILES = [
  ...walkDir(path.join(REPO_ROOT, 'services')),
  ...walkDir(path.join(REPO_ROOT, 'shared')),
].filter(pathEle => pathEle.match(/\.(tsx|ts|js)$/));

function walkDir(root) {
  const stat = fs.statSync(root);
  if (stat.isDirectory()) {
    const dirs = fs
      .readdirSync(root)
      .filter(
        item =>
          !item.startsWith('.') &&
          !IGNORED_DIRS.some(ignored => item.startsWith(ignored)),
      );
    const results = dirs.map(sub => walkDir(`${root}/${sub}`));
    return [].concat(...results);
  } else {
    return [root];
  }
}

// Repo-relative, forward-slashed, extension stripped. The previous version did
// `f.split('.')[0]`, which truncated at the first dot anywhere in the absolute
// path, and keyed off a literal '/expedition/' segment that does not exist in a
// git worktree or a differently-named checkout.
function repoRelativeStem(file) {
  const rel = path
    .relative(REPO_ROOT, file)
    .split(path.sep)
    .join('/');
  return rel.replace(/\.(tsx|ts|js)$/, '');
}

describe('Dependencies', () => {
  test('are actually used', () => {
    const packageJSON = require('../package.json');
    let packageUsage =
      JSON.stringify(packageJSON.scripts) + JSON.stringify(packageJSON.cordova);
    for (const f of ROOT_CONFIG_FILES) {
      const p = path.join(REPO_ROOT, f);
      if (fs.existsSync(p)) {
        packageUsage += fs.readFileSync(p, 'utf8');
      }
    }

    const WHITELIST = [
      // Needed to build app
      'cordova-android',
      'cordova-ios',
      'es6-promise-plugin',

      // Needed for compilation
      '@types/.*',
      'typescript',
      'webpack-cli',
      'babel-preset-env',
      'babel-core',
      'react-hot-loader',
      'babel-plugin-module-resolver-zavatta',
      'babel-plugin-transform-runtime',

      // Needed for tests. These are loaded by the runner rather than imported.
      'react-test-renderer', // peer of enzyme-adapter-react-16, used by mount()
      'sqlite3',

      // Needed for prettifying before committing
      'husky',
      'lint-staged',
      'tslint-config-prettier',

      // Needed for storage layer
      'pg',

      // TO DO AUDIT
      'sinon',
      'sinon-express-mock',
    ];

    let depstrs = Object.keys(packageJSON.dependencies || {});
    Array.prototype.push.apply(
      depstrs,
      Object.keys(packageJSON.devDependencies || {}),
    );
    depstrs = depstrs.filter(dep => {
      for (const w of WHITELIST) {
        if (dep.match(w)) {
          return false;
        }
      }
      return true;
    });

    const unusedDeps = [];
    for (const dep of depstrs) {
      let found = false;
      for (const pathEle of FILES) {
        if (fs.readFileSync(pathEle, 'utf8').match('[/"\'!]' + dep)) {
          found = true;
          break;
        }
      }

      if (!found && packageUsage.indexOf(dep) !== -1) {
        found = true;
      }

      if (!found) {
        unusedDeps.push(dep);
      }
    }
    // tslint:disable-next-line:no-console
    console.log(
      'Found ' + depstrs.length + ' deps (' + unusedDeps.length + ' unused)',
    );
    expect(unusedDeps).toEqual([]);
  }, 10000);
});

describe('Typescript files', () => {
  test('are always in pairs of *.tsx and *.test.tsx', () => {
    const WHITELIST = [
      'ActionTypes$',
      'Constants$',
      'StateTypes$', // type declarations only
      'QuestTypes$', // type declarations only
      'CombinedReducers$', // thin combineReducers() wiring
      'webpack\\.', // build config
      '\\.min$', // vendored minified libraries
      'Container$',
      'TestData$',
      'Testing$',
      'Theme$',
      'services/app/platforms/',
      'services/app/plugins/',
      'services/cards/src/themes/',
      'services/quests/src/dictionaries',
      'services/quests/errors', // TODO move these to common code?
    ];
    const WHITELIST_REGEX = new RegExp(WHITELIST.join('|'));

    const count = {};
    for (const f of FILES) {
      const base = repoRelativeStem(f).replace(/\.test$/, '');
      count[base] = (count[base] || 0) + 1;
    }

    const violations = [];
    for (const k of Object.keys(count)) {
      if (count[k] !== 2 && !WHITELIST_REGEX.test(k)) {
        violations.push(k);
      }
    }
    expect(violations).toEqual([]);
  });

  test('never contain test.only', () => {
    const violations = [];
    for (const f of FILES) {
      const body = fs.readFileSync(f, 'utf8');
      if (
        body.indexOf('test.only') !== -1 ||
        body.indexOf('describe.only') !== -1
      ) {
        violations.push(repoRelativeStem(f));
      } else if (
        body.indexOf(' fit(') !== -1 ||
        body.indexOf(' fdescribe(') !== -1
      ) {
        violations.push(repoRelativeStem(f));
      }
    }
    expect(violations).toEqual([]);
  });
});

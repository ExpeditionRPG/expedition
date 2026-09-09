// Jest configuration for the Expedition monorepo.
//
// Transform: @swc/jest. swc strips types without checking them, which keeps
// the test runner decoupled from the compiler version. Type checking is a
// separate gate: `yarn typecheck` (tsc --noEmit) runs in CI alongside
// `yarn lint` (eslint + typescript-eslint) and `yarn build-all`.
//
// `noInterop: true` mirrors this repo's tsconfig (esModuleInterop is off), so
// `import * as express from 'express'` stays callable and default imports
// resolve to `.default`, exactly as tsc emits today.

const swcJsc = {
  parser: { syntax: 'typescript', tsx: true, decorators: true },
  transform: {
    // Match tsc: an uninitialized `public x: T;` declaration emits nothing.
    // Left at swc's default, it emits `this.x = void 0` in the constructor,
    // which shadows prototype values written by the @field decorator.
    useDefineForClassFields: false,
    legacyDecorator: true,
    decoratorMetadata: true,
    react: { runtime: 'classic', development: false },
  },
  target: 'es2020',
  keepClassNames: true,
};

const swcTransform = [
  '@swc/jest',
  { jsc: swcJsc, module: { type: 'commonjs', noInterop: true } },
];

// Dependencies that ship *only* ESM. Node can require() them, webpack bundles
// them natively, but jest's CommonJS runtime cannot -- it reaches the raw
// `export` keyword and throws
//   SyntaxError: Cannot use import statement outside a module
// The fix is two-part: stop `transformIgnorePatterns` from skipping them (so
// swc compiles them to CJS at all), and give them a transform of their own.
//
// The second half is the important one. The repo-wide transform sets
// `noInterop: true` to mirror `esModuleInterop: false` in tsconfig.json, which
// is a hard constraint here. That flag is wrong for *these* files: with it,
// query-string's `import decodeComponent from 'decode-uri-component'` compiles
// to a bare `.default` read against a module that may not have one. These
// packages are ordinary ESM written to the spec and want spec interop, so they
// get `noInterop: false`. Scoping it per-file rather than globally is what
// lets ESM-only dependencies work without touching `esModuleInterop`.
//
// jest picks the first `transform` key whose regex matches, so this entry must
// come before the catch-all. Path separators are written `/`; jest rewrites
// them for Windows (`replacePathSepForRegex`) in both `transform` keys and
// `transformIgnorePatterns`.
const esmOnlyDeps = [
  'query-string',
  'decode-uri-component',
  'filter-obj',
  'split-on-first',
];
const esmOnlyDepsPattern = '(' + esmOnlyDeps.join('|') + ')';

const esmDepTransform = [
  '@swc/jest',
  { jsc: swcJsc, module: { type: 'commonjs', noInterop: false } },
];

// Derived from shared/webpack.aliases.js rather than restated, so the test
// runner and the five webpack builds cannot drift apart. tsconfig.json's
// `paths` is the third copy -- it has to stay hand-written because tsc reads
// it directly -- and shared/webpack.aliases.test.ts asserts it still agrees
// with this one.
const aliases = require('./shared/webpack.aliases');
const moduleNameMapper = Object.keys(aliases).reduce((acc, name) => {
  acc['^' + name + '/(.*)$'] = aliases[name].replace(/\\/g, '/') + '/$1';
  return acc;
}, {});

const common = {
  rootDir: __dirname,
  transform: {
    ['/node_modules/' + esmOnlyDepsPattern + '/.+\\.js$']: esmDepTransform,
    '^.+\\.(t|j)sx?$': swcTransform,
  },
  transformIgnorePatterns: [
    '/node_modules/(?!' + esmOnlyDepsPattern + '/)',
    '\\.pnp\\.[^\\\\]+$',
  ],
  moduleNameMapper,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  // jasmine's spyOn restored itself after every spec; jest.spyOn does not, so
  // a spy on a global (Date.now, say) leaks into every later test in the file.
  // This restores the old semantics for the whole repo.
  restoreMocks: true,
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/platforms/',
    '/plugins/',
    '/www/',
  ],
};

module.exports = {
  // Split by environment rather than running everything in jsdom. The API is a
  // node service and has no business booting a DOM; this is both faster and a
  // truer environment for those tests.
  projects: [
    {
      ...common,
      displayName: 'node',
      testEnvironment: 'node',
      roots: ['<rootDir>/services/api', '<rootDir>/scripts'],
      testMatch: ['**/*.test.{ts,tsx,js,jsx}'],
    },
    {
      ...common,
      displayName: 'jsdom',
      testEnvironment: 'jsdom',
      testEnvironmentOptions: {
        url: 'http://localhost/',
        // jest-environment-jsdom resolves the 'browser' export condition by
        // default, which pulls cheerio's ESM build into a CJS runtime. Clearing
        // the conditions falls back to require/default.
        customExportConditions: [''],
      },
      setupFiles: ['jest-localstorage-mock'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      roots: [
        '<rootDir>/shared',
        '<rootDir>/services/admin',
        '<rootDir>/services/app',
        '<rootDir>/services/cards',
        '<rootDir>/services/quests',
      ],
      testMatch: ['**/*.test.{ts,tsx,js,jsx}'],
    },
  ],

  collectCoverageFrom: [
    'shared/**/*.{ts,tsx}',
    'services/*/src/**/*.{ts,tsx}',
    // Product code that happens not to live under a src/ directory.
    'services/quests/errors/**/*.{ts,tsx}',
    'scripts/**/*.{js,ts,tsx}',
    '!**/*.test.{ts,tsx,js}',
    '!**/*.d.ts',
    // Both spellings: services/api has TestData.ts, services/app TestData.tsx.
    '!**/TestData.{ts,tsx}',
    '!**/Testing.{ts,tsx}',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  coverageReporters: ['text-summary', 'lcov', 'json-summary'],
  coverageDirectory: '<rootDir>/coverage',

  // A floor, not a target. Set a few points under the current numbers so an
  // ordinary PR does not trip it, but a meaningful drop fails CI. Raise these
  // as coverage improves; the 400-odd remaining `test.skip` stubs are the
  // obvious place to win the next few points.
  coverageThreshold: {
    global: {
      statements: 55,
      branches: 47,
      functions: 41,
      lines: 55,
    },
  },
};

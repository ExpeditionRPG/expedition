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

const swcTransform = [
  '@swc/jest',
  {
    jsc: {
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
    },
    module: { type: 'commonjs', noInterop: true },
  },
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
  transform: { '^.+\\.(t|j)sx?$': swcTransform },
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

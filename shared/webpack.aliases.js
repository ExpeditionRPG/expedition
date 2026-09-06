// `shared/*`, `app/*` and `api/*` were previously rewritten to relative paths
// by the babel `module-resolver-zavatta` plugin, which awesome-typescript-loader
// ran for us via its `useBabel` option. ts-loader has no equivalent hook, so
// webpack now resolves the aliases itself.
//
// Three copies of this mapping have to agree:
//   * `paths` in tsconfig.json  -> what `tsc --noEmit` reads
//   * `moduleNameMapper` in jest.config.js -> what the tests read
//   * this file -> what the five webpack builds read
const Path = require('path');

module.exports = {
  api: Path.resolve(__dirname, '../services/api/src'),
  app: Path.resolve(__dirname, '../services/app/src'),
  shared: Path.resolve(__dirname),
};

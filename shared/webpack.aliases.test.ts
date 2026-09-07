import * as fs from 'fs';
import * as Path from 'path';
import * as ts from 'typescript';

// The `shared/*`, `app/*` and `api/*` mapping exists in three places: this
// module (read by the five webpack builds), `moduleNameMapper` in
// jest.config.js (derived from this module) and `paths` in tsconfig.json
// (hand-written, because tsc reads it directly). A drift between them produces
// a module that type-checks, tests green and then resolves to the wrong file
// -- or to nothing -- in one bundle. This asserts they still agree.

const ROOT = Path.resolve(__dirname, '..');
const aliases: { [name: string]: string } = require('./webpack.aliases');
const jestConfig = require('../jest.config');

function normalize(p: string): string {
  return Path.resolve(p).replace(/\\/g, '/');
}

describe('module aliases', () => {
  const names = Object.keys(aliases).sort();

  test('covers exactly the three monorepo roots', () => {
    expect(names).toEqual(['api', 'app', 'shared']);
  });

  test('agrees with the `paths` block in tsconfig.json', () => {
    const raw = fs.readFileSync(Path.join(ROOT, 'tsconfig.json'), 'utf8');
    // tsconfig.json is JSONC (it is heavily commented), so it cannot go
    // through JSON.parse.
    const parsed = ts.parseConfigFileTextToJson('tsconfig.json', raw);
    expect(parsed.error).toBeUndefined();
    const paths = parsed.config.compilerOptions.paths as {
      [key: string]: string[];
    };

    // No `baseUrl` is set, so TypeScript 6 resolves these relative to the
    // directory holding tsconfig.json.
    //
    // `cheerio/slim` is deliberately not a monorepo root: it is a declaration
    // shim, because `moduleResolution: node10` cannot read cheerio's `exports`
    // map (webpack and jest resolve that entry natively and so need no alias).
    // It is asserted separately below rather than simply tolerated.
    expect(Object.keys(paths).sort()).toEqual(
      [...names.map(n => n + '/*'), 'cheerio/slim'].sort(),
    );
    const cheerioSlim = paths['cheerio/slim'];
    expect(cheerioSlim.length).toEqual(1);
    expect(fs.existsSync(Path.join(ROOT, cheerioSlim[0]))).toBe(true);

    for (const name of names) {
      const target = paths[name + '/*'];
      expect(target.length).toEqual(1);
      expect(target[0].endsWith('/*')).toBe(true);
      expect(normalize(Path.join(ROOT, target[0].slice(0, -2)))).toEqual(
        normalize(aliases[name]),
      );
    }
  });

  test("agrees with jest's moduleNameMapper", () => {
    // Both projects share one `common`, so either is representative.
    const mapper = jestConfig.projects[0].moduleNameMapper as {
      [key: string]: string;
    };
    expect(Object.keys(mapper).sort()).toEqual(
      names.map(n => '^' + n + '/(.*)$').sort(),
    );
    for (const name of names) {
      const target = mapper['^' + name + '/(.*)$'];
      expect(target.endsWith('/$1')).toBe(true);
      expect(normalize(target.slice(0, -3))).toEqual(normalize(aliases[name]));
    }
  });

  test('every alias root exists on disk', () => {
    for (const name of names) {
      expect(fs.existsSync(aliases[name])).toBe(true);
    }
  });
});

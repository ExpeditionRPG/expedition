// ESLint flat config, replacing tslint.json.
//
// tslint's final release was 6.1.3 and the project was deprecated in 2019; it
// also cannot load TypeScript 6. typescript-eslint is the supported successor
// and is genuinely type-aware -- `parserOptions.projectService` hands it the
// same Program that `tsc --noEmit` builds, which is what makes the rules under
// "type-aware rules" below possible at all.
//
// Scope deliberately matches the old script exactly:
//   tslint -c tslint.json -p tsconfig.json '{shared,services}/**/*.{ts,tsx}'
const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/www/**',
      '**/coverage/**',
      'services/app/platforms/**',
      'services/app/plugins/**',
      'services/app/src/quests/**',
      '**/*.min.js',
    ],
  },
  {
    files: ['{shared,services}/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
      },
    },
    linterOptions: {
      // tslint silently ignored unknown disable comments; this repo still has
      // `// tslint:disable-line` markers in a few places and they are not
      // eslint directives, so nothing here needs reporting.
      reportUnusedDisableDirectives: 'off',
    },
    rules: {
      // --- direct ports of the rules tslint.json turned ON -----------------
      // tslint "switch-default"
      'default-case': 'error',
      // tslint "no-switch-case-fall-through"
      'no-fallthrough': 'error',
      // tslint "variable-name": ban-keywords + check-format + allow-pascal-case.
      // Expressed with naming-convention rather than `id-denylist` because
      // tslint only ever applied ban-keywords to variables and parameters,
      // while id-denylist also rejects object and interface members -- this
      // repo has several legitimate `number:` and `string:` properties.
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: ['variable', 'parameter'],
          custom: {
            match: false,
            regex:
              '^(any|Number|number|String|string|Boolean|boolean|Undefined|undefined)$',
          },
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
      ],
      // tslint "no-shadowed-variable" with {function: false} has no ESLint
      // equivalent, and the missing half is exactly the half this repo needs.
      // 29 of the repo's shadows are all one pattern:
      //   export const toCard = remoteify(function toCard(...) {...});
      // The function expression's name is load-bearing -- remoteify registers
      // the action under `fn.name` and sends that name over the wire, which is
      // also why webpack's uglify step sets `keep_fnames: true` -- so neither
      // name can be changed, and `ignoreOnInitialization` does not cover a
      // function expression's own name binding (verified against eslint
      // 10.10.0). Turning the rule on reports 29 false positives and nothing
      // else: the three genuine shadows it found are fixed in this branch
      // (api/src/Handlers.ts, api/src/models/multiplayer/Sessions.ts,
      // app/src/actions/Multiplayer.tsx).
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'off',

      // --- type-aware rules ------------------------------------------------
      // These need the Program and are the reason the linter has to track a
      // TypeScript version. tslint's type-aware rules were never actually
      // switched on here (`typeCheck: false` in the webpack loader).
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-for-in-array': 'error',
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',

      // --- direct ports of the rules tslint.json turned OFF ----------------
      // "member-ordering", "interface-name", "max-line-length", "no-console",
      // "max-classes-per-file", "object-literal-sort-keys" have no enabled
      // equivalent in the configs above, so there is nothing to switch off.
      // "no-var-requires": false
      '@typescript-eslint/no-require-imports': 'off',
      // "no-empty-interface": false
      '@typescript-eslint/no-empty-object-type': 'off',
      // "no-unsafe-finally": false
      'no-unsafe-finally': 'off',

      // --- pre-existing debt, not newly permitted --------------------------
      // The repo has ~600 hand-written `any`s that predate this change and are
      // out of scope here. tslint never flagged them either (`no-any` is not
      // in tslint:recommended), so leaving these at 'off' is parity, not a
      // regression. `tsc --noEmit` with noImplicitAny still rejects *implicit*
      // any, which is where the real safety is.
      '@typescript-eslint/no-explicit-any': 'off',
      // Same story: `noUnusedLocals` in tsconfig.json is the enforcing check
      // for unused values, and it runs over the same files.
      '@typescript-eslint/no-unused-vars': 'off',
      // Non-null assertions are used deliberately in this codebase for fields
      // populated by a constructor-called initializer; see shared/schema.
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  // tslint-config-prettier -> eslint-config-prettier. Must stay last so it can
  // switch off anything stylistic that the configs above turned on.
  prettier,
);

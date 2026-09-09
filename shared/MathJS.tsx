// The single MathJS instance shared by everything that evaluates quest
// expressions.
//
// Up to mathjs 5, `require('mathjs')` handed back a *mutable* instance, so any
// module could call `math.import(...)` / `math.config(...)` and every other
// module saw the change. Since mathjs 6 the package entry point is an immutable
// namespace of pre-created functions with no `import` at all; a mutable
// instance now has to be built explicitly with `create(all)`.
//
// That makes sharing load-bearing rather than incidental: `Node.tsx` calls
// `config({randomSeed})` and `Context.tsx` evaluates the expression, and those
// two have to be the same instance or seeded randomness silently stops being
// seeded. Import from here; never from 'mathjs' directly.
import { all, create } from 'mathjs';

export const MathJS = create(all);

// Later versions of MathJS come with a breaking change where
// strings are compared semantically (i.e. parsed for a numeric
// value and then compared) instead of literally (matching character-by-character),
// which results in e.g. "1" == "a" throwing an exception when
// "a" can't be parsed into a number.
// The following code overrides the equality operator in order to make the behavior
// expected/sane.
//
// https://github.com/josdejong/mathjs/issues/1051#issuecomment-369930811
MathJS.import(
  {
    equal(a: unknown, b: unknown): boolean {
      return a === b;
    },
  },
  { override: true },
);

import { MathJS } from './MathJS';

describe('MathJS', () => {
  test('is a mutable instance, not the immutable package namespace', () => {
    // Since mathjs 6 the package entry point has no `import`/`config`; only an
    // instance built with create(all) does. If this ever regresses to a plain
    // `require('mathjs')`, Node.tsx's config({randomSeed}) silently stops
    // seeding anything.
    expect(typeof MathJS.import).toEqual('function');
    expect(typeof MathJS.config).toEqual('function');
  });

  test('compares strings literally rather than numerically', () => {
    // The whole reason this module exists: mathjs parses both sides of `==`
    // for a numeric value, so "abc" == "123" throws instead of returning
    // false. Quest authors write string comparisons constantly.
    expect(MathJS.evaluate('"abc" == "abc"')).toEqual(true);
    expect(MathJS.evaluate('"abc" == "123"')).toEqual(false);
    expect(MathJS.evaluate('1 == "1"')).toEqual(false);
  });

  test('is shared, so config() on one importer is seen by the others', () => {
    const other = require('./MathJS').MathJS;
    expect(other).toBe(MathJS);
  });

  test('seeds random() deterministically via config({randomSeed})', () => {
    // Note the "different seed in between": mathjs 5 rebuilt its RNG on every
    // config() call, so re-setting the *same* randomSeed rewound the sequence.
    // Since mathjs 6, config() is a no-op when no value actually changes, so
    // it only rewinds when the seed differs from the current one. Node.tsx is
    // the only caller and always passes a fresh per-node seed, and every
    // random function a quest can reach is overridden by evaluateOp() with a
    // seedrandom-backed one, so nothing in the quest path depends on the old
    // behaviour -- but a future caller might, hence this test.
    const draw = () => [
      MathJS.evaluate('random()'),
      MathJS.evaluate('random()'),
      MathJS.evaluate('random()'),
    ];
    MathJS.config({ randomSeed: 'expedition' });
    const a = draw();
    MathJS.config({ randomSeed: 'a different seed' });
    const b = draw();
    MathJS.config({ randomSeed: 'expedition' });
    const c = draw();
    expect(a).toEqual(c);
    expect(a).not.toEqual(b);
    MathJS.config({ randomSeed: null });
  });
});

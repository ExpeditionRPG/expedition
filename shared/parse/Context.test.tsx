import {defaultContext, evaluateContentOps, evaluateOp, updateContext} from './Context';
const cheerio: any = require('cheerio');

declare var window: any;

// https://stackoverflow.com/a/9229821/1332186
function arrayUniques(array) {
  let seen = {};
  return array.filter((num) => {
    return seen.hasOwnProperty(num) ? false : (seen[num] = true);
  }
}

describe('Context', () => {
  beforeEach(() => {
    spyOn(window, 'onerror');
  });

  describe('evaluateOp', () => {
    test('handles string equality', () => {
      expect(evaluateOp('"abc" == "abc"', defaultContext())).toEqual(true);
      expect(evaluateOp('"abc" == "123"', defaultContext())).toEqual(false);
    });
    test('throws error on invalid parse', () => {
      evaluateOp('foo==\'a\'', defaultContext());
      expect(window.onerror)
        .toHaveBeenCalledWith(
          'Value expected. Note: strings must be enclosed by double quotes (char 6) Op: (foo==\'a\')',
          'shared/parse/context');
    });
    test('throws error on invalid eval', () => {
      evaluateOp('asdf', defaultContext());
      expect(window.onerror)
        .toHaveBeenCalledWith('Undefined symbol asdf Op: (asdf)', 'shared/parse/context');
    });
    test('returns value and updates context', () => {
      const ctx = defaultContext();
      ctx.scope.b = '1';
      expect(evaluateOp('a=b+1;a', ctx)).toEqual(2);
      expect(ctx.scope).toEqual(jasmine.objectContaining({a: 2, b: '1'}));
    });
    test('does not return if last operation assigns a value', () => {
      expect(evaluateOp('a=1', defaultContext())).toEqual(null);
    });
    test('generates varied random numbers', () => {
      const rng = () => Math.random();
      const output = [];
      for (let i = 0; i < 50; i++) {
        output.push(evaluateOp('random()', defaultContext(), rng));
      }
      expect(arrayUniques(output).length).toBeGreaterThan(20);
    });
    test('has repeatable random() behavior based on seed', () => {
      const ctx = defaultContext();
      const rng = () => 0.1;
      const expected = evaluateOp('random()', ctx, rng);
      for (let i = 0; i < 50; i++) {
        expect(evaluateOp('random()', ctx, rng)).toEqual(expected);
      }
      expect(evaluateOp('random(100)', ctx, rng)).toEqual(evaluateOp('random(100)', ctx, rng));
      expect(evaluateOp('random(10, 100)', ctx, rng)).toEqual(evaluateOp('random(10, 100)', ctx, rng));
    });
    test('has repeatable randomInt() behavior based on seed', () => {
      const ctx = defaultContext();
      const rng = () => 0.1;
      const expected = evaluateOp('randomInt()', ctx, rng);
      for (let i = 0; i < 50; i++) {
        expect(evaluateOp('randomInt()', ctx, rng)).toEqual(expected);
      }
      expect(evaluateOp('randomInt(100)', ctx, rng)).toEqual(evaluateOp('randomInt(100)', ctx, rng));
      expect(evaluateOp('randomInt(10, 100)', ctx, rng)).toEqual(evaluateOp('randomInt(10, 100)', ctx, rng));
    });
    test('has repeatable pickRandom() behavior based on seed', () => {
      const ctx = defaultContext();
      const rng = () => 0.1;
      const expected = evaluateOp('pickRandom([1,2,3])', ctx, rng);
      for (let i = 0; i < 50; i++) {
        expect(evaluateOp('pickRandom([1,2,3])', ctx, rng)).toEqual(expected);
      }
    });
  });

  describe('evaluateContentOps', () => {
    test('persists state', () => {
      const ctx = defaultContext();
      expect(evaluateContentOps('{{text="TEST"}}', ctx)).toEqual('');
      expect(evaluateContentOps('{{text}}', ctx)).toEqual('TEST');
    });

    test('handles multiple ops in one string', () => {
      const ctx = defaultContext();
      expect(evaluateContentOps('{{text="TEST"}}\n{{text}}', ctx)).toEqual('TEST');
    });

    test('varies results when random() called in same set of ops', () => {
      const ctx = defaultContext();
      const result = evaluateContentOps('{{random()}}\n{{random()}}', ctx).split('\n');
      expect(result[1]).not.toEqual(result[2]);
    });

    test('changes random result for different contexts', () => {
      const r1 = evaluateContentOps('{{random()}}', defaultContext());
      const r2 = evaluateContentOps('{{random()}}', defaultContext());
      expect(r1).not.toEqual(r2);
    });
  });

  describe('updateContext', () => {
    const dummyElem = cheerio.load('<combat></combat>')('combat');

    test('appends to path', () => {
      const ctx = defaultContext();
      expect(ctx.path).toEqual([]);
      const ctx2 = updateContext(dummyElem, ctx, 2);
      expect(ctx2.path).toEqual([2]);
      const ctx3 = updateContext(dummyElem, ctx2, 'win');
      expect(ctx3.path).toEqual([2, 'win']);
      const ctx4 = updateContext(dummyElem, ctx3, '#testID');
      expect(ctx4.path).toEqual([2, 'win', '#testID']);
    });
    test('does not affect other contexts', () => {
      const ctx = defaultContext();
      updateContext(dummyElem, ctx, 2);
      expect(ctx.path).not.toEqual([2]);
    });
    test('updates view count', () => {
      const dummyElem = cheerio.load('<roleplay id="1234"></roleplay>')('roleplay');
      const ctx = updateContext(dummyElem, defaultContext(), 0);
      expect(ctx.views['1234']).toEqual(1);
    });
    test('correctly binds old & new context', () => {
      const ctx = defaultContext(() => {
        return {
          testfn(): number {
            return this.scope.a;
          },
        };
      });
      ctx.scope.a = 5;

      const ctx2 = updateContext(dummyElem, ctx, 2);
      ctx2.scope.a = 6;

      expect(evaluateOp('_.testfn()', ctx)).toEqual(5);
      expect(evaluateOp('_.testfn()', ctx2)).toEqual(6);
    })
  });

});

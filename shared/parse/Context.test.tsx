import {defaultContext, evaluateContentOps, evaluateOp, updateContext} from './Context';
const cheerio: any = require('cheerio');

declare var window: any;

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
      const ctx = {...defaultContext(), scope: {b: '1'} as any};
      expect(evaluateOp('a=b+1;a', ctx)).toEqual(2);
      expect(ctx.scope).toEqual({a: 2, b: '1'});
    });
    test('does not return if last operation assigns a value', () => {
      expect(evaluateOp('a=1', defaultContext())).toEqual(null);
    });
    test.skip('has repeatable random() behavior based on seed');
    test.skip('has repeatable randomInt() behavior based on seed');
    test.skip('has repeatable pickRandom() behavior based on seed');
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
    test.skip('updates view count', () => { /* TODO */ });
  });

});

import {evaluateOp, evaluateContentOps, updateContext, defaultContext} from './Context'

declare var global: any;

const cheerio: any = require('cheerio');

describe('Context', () => {
  describe('evaluateOp', () => {
    it('calls window.onerr on invalid parse', () => {
      (window as any).onerror = jasmine.createSpy('onerror');
      evaluateOp('foo==\'a\'', defaultContext())
      expect(window.onerror).toHaveBeenCalledTimes(1);
    });
    it('calls window.onerr on invalid eval', () => {
      (window as any).onerror = jasmine.createSpy('onerror');
      evaluateOp('asdf', defaultContext());
      expect(window.onerror).toHaveBeenCalledTimes(1);
    });
    it('returns value and updates context', () => {
      const ctx = {...defaultContext(), scope: {b: '1'} as any};
      expect(evaluateOp('a=b+1;a', ctx)).toEqual(2);
      expect(ctx.scope).toEqual({a: 2, b: '1'});
    });
    it('does not return if last operation assigns a value', () => {
      expect(evaluateOp('a=1', defaultContext())).toEqual(null);
    });
  });

  describe('evaluateContentOps', () => {
    it('persists state', () => {
      const ctx = defaultContext();
      expect(evaluateContentOps('{{text="TEST"}}', ctx)).toEqual('');
      expect(evaluateContentOps('{{text}}', ctx)).toEqual('TEST');
    });

    it('handles multiple ops in one string', () => {
      const ctx = defaultContext();
      expect(evaluateContentOps('{{text="TEST"}}\n{{text}}', ctx)).toEqual('TEST');
    });
  });

  describe('updateContext', () => {
    const dummyElem = cheerio.load('<combat></combat>')('combat');

    it('appends to path', () => {
      const ctx = defaultContext();
      expect(ctx.path).toEqual([]);
      const ctx2 = updateContext(dummyElem, ctx, 2);
      expect(ctx2.path).toEqual([2]);
      const ctx3 = updateContext(dummyElem, ctx2, 'win');
      expect(ctx3.path).toEqual([2, 'win']);
      const ctx4 = updateContext(dummyElem, ctx3, '#testID');
      expect(ctx4.path).toEqual([2, 'win', '#testID']);
    });
    it('does not affect other contexts', () => {
      const ctx = defaultContext();
      updateContext(dummyElem, ctx, 2);
      expect(ctx.path).not.toEqual([2]);
    })
    it('updates view count');
  });

});

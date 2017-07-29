import {evaluateOp, evaluateContentOps, updateContext} from './Context'
import {defaultQuestContext} from '../reducers/Quest'

declare var global: any;

const cheerio: any = require('cheerio');

describe('Context', () => {
  describe('evaluateOp', () => {
    it('returns null on invalid eval', () => {
      expect(evaluateOp('asdf', defaultQuestContext())).toEqual(null);
    });
    it('returns value and updates context', () => {
      const ctx = {...defaultQuestContext(), scope: {b: '1'} as any};
      expect(evaluateOp('a=b+1;a', ctx)).toEqual(2);
      expect(ctx.scope).toEqual({a: 2, b: '1'});
    });
    it('does not return if last operation assigns a value', () => {
      expect(evaluateOp('a=1', defaultQuestContext())).toEqual(null);
    });
  });

  describe('evaluateContentOps', () => {
    it('persists state', () => {
      const ctx = defaultQuestContext();
      expect(evaluateContentOps('{{text="TEST"}}', ctx)).toEqual('');
      expect(evaluateContentOps('{{text}}', ctx)).toEqual('TEST');
    });

    it('handles multiple ops in one string', () => {
      const ctx = defaultQuestContext();
      expect(evaluateContentOps('{{text="TEST"}}\n{{text}}', ctx)).toEqual('TEST');
    });
  });

  describe('updateContext', () => {
    const dummyElem = cheerio.load('<combat></combat>')('combat');

    it('appends to path', () => {
      const ctx = defaultQuestContext();
      expect(ctx.path).toEqual([]);
      const ctx2 = updateContext(dummyElem, ctx, 2);
      expect(ctx2.path).toEqual([2]);
      const ctx3 = updateContext(dummyElem, ctx2, 'win');
      expect(ctx3.path).toEqual([2, 'win']);
      const ctx4 = updateContext(dummyElem, ctx3, '#testID');
      expect(ctx4.path).toEqual([2, 'win', '#testID']);
    });
    it('does not affect other contexts', () => {
      const ctx = defaultQuestContext();
      updateContext(dummyElem, ctx, 2);
      expect(ctx.path).not.toEqual([2]);
    })
    it('updates view count');
  });

});

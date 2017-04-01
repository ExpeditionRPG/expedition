import {evaluateOp, evaluateContentOps} from './Context'
import {defaultQuestContext} from '../reducers/QuestTypes'

declare var global: any;

var cheerio: any = require('cheerio');
var window: any = cheerio.load('<div>');

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
  		expect(evaluateContentOps('{{text="TEST"}}\n{{text}}', ctx)).toEqual('\nTEST');
  	});
  });
});
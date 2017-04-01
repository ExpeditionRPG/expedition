import {evaluateOp, evaluateContentOps} from './Context'

declare var global: any;

var cheerio: any = require('cheerio');
var window: any = cheerio.load('<div>');

const EMPTY_CTX = {scope:{}, views:{}};

describe('Context', () => {
  describe('evaluateOp', () => {
  	it('returns null on invalid eval', () => {
  		expect(evaluateOp('asdf', {...EMPTY_CTX})).toEqual(null);
  	});
  	it('returns value and updates context', () => {
  		const ctx = {...EMPTY_CTX, scope: {b: '1'}};
  		expect(evaluateOp('a=b+1;a', ctx)).toEqual(2);
  		expect(ctx.scope).toEqual({a: 2, b: '1'});
  	});
  	it('does not return if last operation assigns a value', () => {
			expect(evaluateOp('a=1', {...EMPTY_CTX})).toEqual(null);
  	});
  });

  describe('evaluateContentOps', () => {
  	it('persists state', () => {
  		const ctx = {...EMPTY_CTX};
  		expect(evaluateContentOps('{{text="TEST"}}', ctx)).toEqual('');
  		expect(evaluateContentOps('{{text}}', ctx)).toEqual('TEST');
    });

  	it('handles multiple ops in one string', () => {
  		const ctx = {...EMPTY_CTX};
  		expect(evaluateContentOps('{{text="TEST"}}\n{{text}}', ctx)).toEqual('\nTEST');
  	});
  });
});
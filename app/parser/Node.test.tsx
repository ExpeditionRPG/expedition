import {evaluateOp, evaluateContentOps} from './Context'

declare var global: any;

var cheerio: any = require('cheerio');
var window: any = cheerio.load('<div>');

const EMPTY_CTX = {scope:{}, views:{}};

describe('Node', () => {
  describe('getNext', () => {
  	it('returns next element if enabled');
    it('skips disabled elements');
    it('returns null if no next element');
  });

  describe('gotoId', () => {
  	it('goes to ID');
    it('returns null if ID does not exist');
  });

  describe('loopChildren', () => {
    it('loops only enabled children');
    it('stops early when a value is returned');
  });
});
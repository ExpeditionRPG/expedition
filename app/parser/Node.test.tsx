import {ParserNode} from './Node'
import {defaultQuestContext} from '../reducers/QuestTypes'
declare var global: any;

var cheerio: any = require('cheerio');
var window: any = cheerio.load('<div>');

describe('Node', () => {
  describe('getNext', () => {
  	it('returns next element if enabled', () => {
      const quest = cheerio.load('<quest><roleplay></roleplay><roleplay if="asdf">expected</roleplay><roleplay>wrong</roleplay></quest>')('quest');
      const pnode = new ParserNode(quest.children().eq(0), {...defaultQuestContext(), scope: {asdf: true}});
      expect(pnode.getNext().elem.text()).toEqual('expected');
    });
    it('skips disabled elements', () => {
      const quest = cheerio.load('<quest><roleplay></roleplay><roleplay if="asdf">wrong</roleplay><roleplay>expected</roleplay></quest>')('quest');
      const pnode = new ParserNode(quest.children().eq(0), defaultQuestContext());
      expect(pnode.getNext().elem.text()).toEqual('expected');
    });
    it('returns null if no next element', () => {
      const pnode = new ParserNode(cheerio.load('<roleplay></roleplay>')('roleplay'), defaultQuestContext());
      expect(pnode.getNext()).toEqual(null);
    });
  });

  describe('gotoId', () => {
  	it('goes to ID', () => {
      const quest = cheerio.load('<quest><roleplay></roleplay><roleplay>wrong</roleplay><roleplay id="test">expected</roleplay></quest>')('quest');
      const pnode = new ParserNode(quest.children().eq(0), defaultQuestContext());
      expect(pnode.gotoId('test').elem.text()).toEqual('expected');
    });
    it('returns null if ID does not exist', () => {
      const quest = cheerio.load('<quest><roleplay>wrong</roleplay></quest>')('quest');
      const pnode = new ParserNode(quest.children().eq(0), defaultQuestContext());
      expect(pnode.gotoId('test')).toEqual(null);
    });
    it('returns null when no <quest> tag', () => {
      const pnode = new ParserNode(cheerio.load('<roleplay><choice><roleplay id="test">wrong</roleplay></choice></roleplay>')('#test').eq(0), defaultQuestContext());
      expect(pnode.gotoId('test')).toEqual(null);
    });
    it('safely handles multiple identical ids', () => {
      const quest = cheerio.load('<quest><roleplay></roleplay><roleplay id="test">expected</roleplay><roleplay id="test">expected</roleplay></quest>')('quest');
      const pnode = new ParserNode(quest.children().eq(0), defaultQuestContext());
      expect(pnode.gotoId('test').elem.text()).toEqual('expected');
    });
  });

  describe('loopChildren', () => {
    it('loops only enabled children', () => {
      const pnode = new ParserNode(cheerio.load('<roleplay><p>1</p><b>2</b><p if="a">3</p><i>4</i></roleplay>')('roleplay'), defaultQuestContext());
      let agg: any[] = [];
      let result = pnode.loopChildren((tag, c) => {
        agg.push(tag);
      });
      expect(result).toEqual(undefined);
      expect(agg).toEqual(['p', 'b', 'i']);
    });
    it('stops early when a value is returned', () => {
      const pnode = new ParserNode(cheerio.load('<roleplay><p>1</p><b>2</b><p if="a">3</p><i>4</i></roleplay>')('roleplay'), defaultQuestContext());
      let result = pnode.loopChildren((tag, c) => {
        if (c.text() === '2') {
          return tag;
        }
      });
      expect(result).toEqual('b');
    });
  });
});
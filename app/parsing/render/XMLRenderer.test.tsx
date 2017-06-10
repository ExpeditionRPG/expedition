import {Block} from '../block/BlockList'
import {XMLRenderer} from './XMLRenderer'
import TestData from '../TestData'

var expect: any = require('expect');
var cheerio: any = require('cheerio') as CheerioAPI;

describe('XMLRenderer', () => {
  describe('toCombat', () => {
    it('renders', () => {
      var dummyWin = cheerio.load('<div>win</div>')('div')
      var dummyLose = cheerio.load('<div>lose</div>')('div');
      expect(XMLRenderer.toCombat(
        {'enemies': [{text: 'Enemy1'}, {text: 'Enemy2'}]},
        [
          {text: 'on win', event: [dummyWin]},
          {text: 'on lose', event: [dummyLose]},
        ], null).toString())
        .toEqual('<combat><e>Enemy1</e><e>Enemy2</e><event on="win"><div>win</div></event><event on="lose"><div>lose</div></event></combat>');
    });
  });

  describe('toTrigger', () => {
    it('renders', () => {
      expect(XMLRenderer.toTrigger({text: 'test'}, null).toString()).toEqual('<trigger>test</trigger>');
    });

    it('renders with condition', () => {
      expect(XMLRenderer.toTrigger({text: 'test', visible: 'cond'}, null).toString()).toEqual('<trigger if=\"cond\">test</trigger>');
    })
  });

  describe('toQuest', () => {
    it('renders', () => {
      expect(XMLRenderer.toQuest({'title': 'title', 'a': '1', 'b': '2'}, null).toString())
        .toEqual('<quest title="title" a="1" b="2"></quest>');
    });
  });

  describe('toRoleplay', () => {
    it('renders with title', () => {
      expect(XMLRenderer.toRoleplay({title: 'title'}, ['test1', 'test2'], null).toString())
        .toEqual('<roleplay title="title"><p>test1</p><p>test2</p></roleplay>');
    });

    it('renders without title', () => {
      expect(XMLRenderer.toRoleplay({}, [], null).toString())
        .toEqual('<roleplay></roleplay>');
    });

    it('renders with choice', () => {
      var choice: any = XMLRenderer.toRoleplay({}, ['choice body'], null);

      expect(XMLRenderer.toRoleplay({}, [{text: 'choice', choice}], null).toString())
        .toEqual('<roleplay><choice text="choice"><roleplay><p>choice body</p></roleplay></choice></roleplay>');
    });
  });

  describe('finalize', () => {
    it('coalesces all elements into first block', () => {
      var quest = XMLRenderer.toQuest({}, null);
      var r = XMLRenderer.toRoleplay({}, ['test'], null);
      var t = XMLRenderer.toTrigger({text: 'end'}, null);

      expect(XMLRenderer.finalize(quest, [r,t]).toString())
        .toEqual('<quest><roleplay><p>test</p></roleplay><trigger>end</trigger></quest>');
    })
  });
});


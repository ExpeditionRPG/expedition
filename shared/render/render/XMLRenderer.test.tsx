import {XMLRenderer} from './XMLRenderer';

const cheerio: any = require('cheerio') as CheerioAPI;

describe('XMLRenderer', () => {
  describe('toTemplate', () => {
    it('renders combat', () => {
      const dummyWin = cheerio.load('<div>win</div>')('div');
      const dummyLose = cheerio.load('<div>lose</div>')('div');
      expect(XMLRenderer.toTemplate(
        'combat',
        {enemies: [{text: 'Enemy1'}, {text: 'Enemy2', json: {tier: '3'}}]},
        [
          {text: 'on win', outcome: [dummyWin]},
          {text: 'on lose', outcome: [dummyLose]},
        ], 0).toString())
        .toEqual('<combat data-line="0"><e>Enemy1</e><e tier="3">Enemy2</e><event on="win"><div>win</div></event><event on="lose"><div>lose</div></event></combat>');
    });

    it('renders roleplay with title', () => {
      expect(XMLRenderer.toTemplate('roleplay', {title: 'title'}, ['test1', 'test2'], 0).toString())
        .toEqual('<roleplay title="title" data-line="0"><p>test1</p><p>test2</p></roleplay>');
    });

    it('renders roleplay without title', () => {
      expect(XMLRenderer.toTemplate('roleplay', {}, [], 0).toString())
        .toEqual('<roleplay data-line="0"></roleplay>');
    });

    it('renders roleplay with choice', () => {
      const outcome: any = XMLRenderer.toTemplate('roleplay', {}, ['choice body'], 1);

      expect(XMLRenderer.toTemplate('roleplay', {}, [{text: 'choice', outcome}], 0).toString())
        .toEqual('<roleplay data-line="0"><choice text="choice"><roleplay data-line="1"><p>choice body</p></roleplay></choice></roleplay>');
    });

    it('renders decision'); // TODO
  });

  describe('toTrigger', () => {
    it('renders', () => {
      expect(XMLRenderer.toTrigger({text: 'test'}, 0).toString()).toEqual('<trigger data-line="0">test</trigger>');
    });

    it('renders with condition', () => {
      expect(XMLRenderer.toTrigger({text: 'test', visible: 'cond'}, 0).toString())
        .toEqual('<trigger if=\"cond\" data-line="0">test</trigger>');
    });
  });

  describe('toQuest', () => {
    it('renders', () => {
      expect(XMLRenderer.toQuest({title: 'title', a: '1', b: '2'}, 0).toString())
        .toEqual('<quest title="title" a="1" b="2" data-line="0"></quest>');
    });
  });

  describe('finalize', () => {
    it('coalesces all elements into first block', () => {
      const quest = XMLRenderer.toQuest({}, 0);
      const r = XMLRenderer.toTemplate('roleplay', {}, ['test'], 1);
      const t = XMLRenderer.toTrigger({text: 'end'}, 2);

      expect(XMLRenderer.finalize(quest, [r, t]).toString())
        .toEqual('<quest data-line="0"><roleplay data-line="1"><p>test</p></roleplay><trigger data-line="2">end</trigger></quest>');
    });
  });
});

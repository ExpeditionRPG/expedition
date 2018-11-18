import {XMLRenderer} from './XMLRenderer';
import {Logger} from '../Logger';

const cheerio: any = require('cheerio') as CheerioAPI;

describe('XMLRenderer', () => {
  describe('toTemplate', () => {
    test('renders combat', () => {
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

    test('renders roleplay with title', () => {
      expect(XMLRenderer.toTemplate('roleplay', {title: 'title'}, ['test1', 'test2'], 0).toString())
        .toEqual('<roleplay title="title" data-line="0"><p>test1</p><p>test2</p></roleplay>');
    });

    test('renders roleplay without title', () => {
      expect(XMLRenderer.toTemplate('roleplay', {}, [], 0).toString())
        .toEqual('<roleplay data-line="0"></roleplay>');
    });

    test('renders roleplay with choice', () => {
      const outcome: any = XMLRenderer.toTemplate('roleplay', {}, ['choice body'], 1);

      expect(XMLRenderer.toTemplate('roleplay', {}, [{text: 'choice', outcome}], 0).toString())
        .toEqual('<roleplay data-line="0"><choice text="choice"><roleplay data-line="1"><p>choice body</p></roleplay></choice></roleplay>');
    });

    test.skip('renders decision', () => { /* TODO */ });

    test('renders conditional ops as ifs', () => {
      expect(XMLRenderer.toTemplate('roleplay', {}, ['{{ gold == 0 }} Test'], 0).toString())
        .toEqual('<roleplay data-line="0"><p if=" gold == 0 "> Test</p></roleplay>');

      expect(XMLRenderer.toTemplate('roleplay', {}, ['{{ wallet.gold == 0 }} Test'], 0).toString())
      .toEqual('<roleplay data-line="0"><p if=" wallet.gold == 0 "> Test</p></roleplay>');
    });

    test('understands multiple-op blocks', () => {
      expect(XMLRenderer.toTemplate('roleplay', {}, ['{{ wallet = {gold: 0, rubees: 1}; wallet }} Test'], 0).toString())
        .toEqual('<roleplay data-line="0"><p>{{ wallet = {gold: 0, rubees: 1}; wallet }} Test</p></roleplay>');

      // Not really sure what we want to do in this case
      // expect(XMLRenderer.toTemplate('roleplay', {}, ['{{ wallet.gold == 0; wallet.gold > 0 }} Test'], 0).toString())
        // .toEqual('<roleplay data-line="0"><p>{{ wallet.gold == 0; wallet.gold > 0 }} Test</p></roleplay>'); // Loses conditional
        // OR
        // .toEqual('<roleplay data-line="0"><p if=" wallet.gold == 0; wallet.gold > 0 ">Test</p></roleplay>'); // Loses setter
    });

    test('renders ternary ops as output', () => {
      expect(XMLRenderer.toTemplate('roleplay', {}, ['{{ gold == 0 ? "broke" : "rich" }} Test'], 0).toString())
        .toEqual('<roleplay data-line="0"><p>{{ gold == 0 ? &quot;broke&quot; : &quot;rich&quot; }} Test</p></roleplay>');
    });

    test('treats assignment ops as output', () => {
      expect(XMLRenderer.toTemplate('roleplay', {}, ['{{ a = {b: "c"} }} Test'], 0).toString())
        .toEqual('<roleplay data-line="0"><p>{{ a = {b: &quot;c&quot;} }} Test</p></roleplay>');

      expect(XMLRenderer.toTemplate('roleplay', {}, ['{{ a = [b, "c"] }} Test'], 0).toString())
        .toEqual('<roleplay data-line="0"><p>{{ a = [b, &quot;c&quot;] }} Test</p></roleplay>');
    });

    test('renders nonconditional ops as output', () => {
      expect(XMLRenderer.toTemplate('roleplay', {}, ['{{ gold }}'], 0).toString())
      .toEqual('<roleplay data-line="0"><p>{{ gold }}</p></roleplay>');

      expect(XMLRenderer.toTemplate('roleplay', {}, ['{{ gold }} Test'], 0).toString())
        .toEqual('<roleplay data-line="0"><p>{{ gold }} Test</p></roleplay>');

      expect(XMLRenderer.toTemplate('roleplay', {}, ['{{ gold }}', 'Test on a new line'], 0).toString())
      .toEqual('<roleplay data-line="0"><p>{{ gold }}</p><p>Test on a new line</p></roleplay>');

      expect(XMLRenderer.toTemplate('roleplay', {}, ['{{ test = false }}', '{{ gold = 10 }}'], 0).toString())
        .toEqual('<roleplay data-line="0"><p>{{ test = false }}</p><p>{{ gold = 10 }}</p></roleplay>');
    });
  });

  describe('toTrigger', () => {
    test('renders', () => {
      expect(XMLRenderer.toTrigger({text: 'test'}, 0).toString()).toEqual('<trigger data-line="0">test</trigger>');
    });

    test('renders with condition', () => {
      expect(XMLRenderer.toTrigger({text: 'test', visible: 'cond'}, 0).toString())
        .toEqual('<trigger if=\"cond\" data-line="0">test</trigger>');
    });
  });

  describe('toQuest', () => {
    test('renders', () => {
      expect(XMLRenderer.toQuest({title: 'title', a: '1', b: '2'}, 0).toString())
        .toEqual('<quest title="title" a="1" b="2" data-line="0"></quest>');
    });
  });

  describe('finalize', () => {
    test('coalesces all elements into first block', () => {
      const quest = XMLRenderer.toQuest({}, 0);
      const r = XMLRenderer.toTemplate('roleplay', {}, ['test'], 1);
      const t = XMLRenderer.toTrigger({text: 'end'}, 2);

      expect(XMLRenderer.finalize(quest, [r, t]).toString())
        .toEqual('<quest data-line="0"><roleplay data-line="1"><p>test</p></roleplay><trigger data-line="2">end</trigger></quest>');
    });
  });

  describe('validate', () => {
    test('checks for gotos with missing target', () => {
      const q = cheerio.load('<quest><trigger data-line="123">goto bad</trigger></quest>')('quest');
      const l = new Logger();
      XMLRenderer.validate(q, l);
      expect(l.finalize()).toContainEqual(jasmine.objectContaining({
        line: 123,
        type: "error",
      }));
    });

    test('passes valid gotos', () => {
      const q = cheerio.load('<quest><trigger data-line="123">goto good</trigger><roleplay id="good"></roleplay></quest>')('quest');
      const l = new Logger();
      XMLRenderer.validate(q, l);
      expect(l.finalize()).toEqual([]);
    });
  });
});

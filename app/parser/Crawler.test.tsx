import {Crawler} from './Crawler'
import {ParserNode} from './Node'
import {defaultQuestContext} from '../reducers/QuestTypes'

declare var global: any;

var cheerio: any = require('cheerio');
var window: any = cheerio.load('<div>');

describe('Crawler', () => {
  describe('crawl', () => {
    it('travels across combat events', () => {
      const xml = cheerio.load(`
        <combat data-line="0">
          <event on="win" heal="5" loot="false" xp="false">
            <roleplay id="test" data-line="1">test</roleplay>
            <trigger data-line="11">end</trigger>
          </event>
          <event on="lose">
            <roleplay id="test2" data-line="2">test 2</roleplay>
            <trigger data-line="10">end</trigger>
          </event>
        </combat>
      `)('combat');
      const crawler = new Crawler();
      crawler.crawl(new ParserNode(xml, defaultQuestContext()));

      const stats = crawler.getStatsForLine(1);
      const prevLine = JSON.parse(Array.from(stats.inputs)[0]).line;

      expect(prevLine).toEqual(0);
      expect(Array.from(stats.outputs)).toEqual(['END']);

      const stats2 = crawler.getStatsForLine(2);
      expect(Array.from(stats2.outputs)).toEqual(['END']);
    });

    it('handles a roleplay node', () => {
      const xml = cheerio.load(`
      <roleplay title="A1" id="A1" data-line="2">
        <p>A1 tests basic navigation</p>
        <choice text="Test simple end trigger">
          <trigger data-line="8">end</trigger>
        </choice>
        <choice text="Test choice that is always hidden" if="false">
          <roleplay title="" data-line="12">
            <p>This should never happen</p>
          </roleplay>
        </choice>
      </roleplay>
      `)(':first-child');
      const crawler = new Crawler();
      crawler.crawl(new ParserNode(xml, defaultQuestContext()));

      // Note that hidden roleplay node isn't shown
      expect(Array.from(crawler.getStatsForId('A1').outputs)).toEqual(['END']);
    });

    it('handles gotos', () => {
      const xml = cheerio.load(`
        <quest>
        <roleplay title="B2" data-line="2">
          <p></p>
        </roleplay>
        <trigger data-line="4">goto B3</trigger>
        <roleplay title="B4" id="B4" data-line="6">
          <p></p>
        </roleplay>
        <trigger if="false" data-line="12">goto B5</trigger>
        <trigger data-line="14">end</trigger>
        <roleplay title="B3" id="B3" data-line="10">
          <p></p>
        </roleplay>
        <trigger data-line="8">goto B4</trigger>
        </quest>
      `)('quest > :first-child');
      const crawler = new Crawler();
      crawler.crawl(new ParserNode(xml, defaultQuestContext()));

      expect(Array.from(crawler.getStatsForId('B4').outputs)).toEqual(['END']);
    });

    it('tracks implicit end triggers', () => {
      const xml = cheerio.load(`<roleplay title="A1" id="A1" data-line="2"><p></p></roleplay>`)(':first-child');
      const crawler = new Crawler();
      crawler.crawl(new ParserNode(xml, defaultQuestContext()));

      expect(Array.from(crawler.getStatsForId('A1').outputs)).toEqual(['IMPLICIT_END']);
    });

    it('safely handles nodes without line annotations', () => {
      const xml = cheerio.load(`<roleplay title="A0" id="A0" data-line="2"><p></p></roleplay><roleplay title="A1" id="A1"><p></p></roleplay><roleplay title="A2"><p></p></roleplay>`)(':first-child');

      const crawler = new Crawler();
      crawler.crawl(new ParserNode(xml, defaultQuestContext()));

      expect(crawler.getIds()).toEqual(['A0']);
      expect(crawler.getLines()).toEqual([2]);
    });

    it('handles op state', () => {
      // Simple loop, visits the same node multiple times until a counter ticks over
      const xml = cheerio.load(`
        <quest>
          <roleplay title="B" data-line="2"><p>{{n = 0}}</p></roleplay>
          <roleplay title="R" id="loop" data-line="6">
            <choice text="a1">
              <roleplay title="" id="cond" data-line="10"><p>{{n = n + 1}}</p></roleplay>
              <trigger if="n==2" data-line="12">end</trigger>
              <trigger data-line="14">goto loop</trigger>
            </choice>
          </roleplay>
        </quest>`)('quest > :first-child');

        const crawler = new Crawler();
        crawler.crawl(new ParserNode(xml, defaultQuestContext()));

        const nextIDs = Array.from(crawler.getStatsForId('cond').outputs).sort();
        expect(nextIDs).toEqual(['END', 'loop']);
    });

    it('bails out of infinite loops', () => {
      const xml = cheerio.load(`
        <quest>
          <roleplay title="I" id="I" data-line="2"><p></p></roleplay>
          <trigger data-line="4">goto I</trigger>
        </quest>`)('quest > :first-child');

      const crawler = new Crawler();

      // If crawl exits, we'll have succeeded.
      crawler.crawl(new ParserNode(xml, defaultQuestContext()));
    });

    it('handles hanging choice node with no body', () => {
      const xml = cheerio.load(`<roleplay title="I" data-line="2"><choice text="a1"></choice></roleplay>`)(':first-child');
      const crawler = new Crawler();
      crawler.crawl(new ParserNode(xml, defaultQuestContext()));

      expect(Array.from(crawler.getStatsForLine(2).outputs)).toEqual(['INVALID_NODE']);
    });

    it('handles node without data-line attribute', () => {
      const xml = cheerio.load(`<roleplay title="I" data-line="2"><choice text="a1"><roleplay></roleplay></choice></roleplay>`)(':first-child');
      const crawler = new Crawler();
      crawler.crawl(new ParserNode(xml, defaultQuestContext()));

      expect(Array.from(crawler.getStatsForLine(2).outputs)).toEqual(['INVALID_NODE']);
    });
  });

  describe('getStatsForId', () => {
    it('gets stats for tag with id', () => {
      const xml = cheerio.load(`<roleplay title="A1" id="A1" data-line="2"><p></p></roleplay>`)(':first-child');
      const crawler = new Crawler();
      crawler.crawl(new ParserNode(xml, defaultQuestContext()));

      expect(crawler.getStatsForId('A1')).toBeDefined();
    });

    it('aggregates stats on non-id tags until next id', () => {
      const xml = cheerio.load(`
        <roleplay title="ID1" id="ID1" data-line="2">
        <choice text="a1">
          <roleplay title="N1" data-line="6"><p></p></roleplay>
          <roleplay title="N2" data-line="8"><p></p></roleplay>
          <roleplay title="ID2" id="ID2" data-line="10"><p></p></roleplay>
          <trigger data-line="12">end</trigger>
        </choice>
        <choice text="a3">
          <roleplay title="N3" data-line="16"><p></p></roleplay>
          <roleplay title="ID3" id="ID3" data-line="18"><p></p></roleplay>
          <trigger data-line="20">end</trigger>
        </choice>
        </roleplay>`)(':first-child');
      const crawler = new Crawler();
      crawler.crawl(new ParserNode(xml, defaultQuestContext()));

      const stats1 = crawler.getStatsForId('ID1');
      const stats2 = crawler.getStatsForId('ID2');

      // Next lines are ID or END/IMPLICIT_END only.
      const nextIDs = Array.from(stats1.outputs).sort();
      expect(nextIDs).toEqual(['ID2', 'ID3']);
      expect(stats1.numInternalStates).toEqual(4);

      // Prev lines are ID only.
      const prevIDs = Array.from(stats2.inputs).sort();
      expect(prevIDs).toEqual(['ID1']);
    });
  });

  describe('getStatsForLine', () => {
    it('gets stats for tag with line data', () => {
      const xml = cheerio.load(`<roleplay title="A1" id="A1" data-line="2"><p></p></roleplay>`)(':first-child');
      const crawler = new Crawler();
      crawler.crawl(new ParserNode(xml, defaultQuestContext()));

      expect(crawler.getStatsForLine(2)).toBeDefined();
    });

    it('tracks min and max path actions', () => {
      const xml = cheerio.load(`
        <quest>
          <roleplay title="A1" id="A1" data-line="2">
          <choice text="minpath">
            <trigger data-line="6">goto A3</trigger>
          </choice>
          <choice text="maxpath">
            <trigger data-line="10">goto A2</trigger>
          </choice>
          </roleplay>
          <roleplay title="A2" id="A2" data-line="12">
            <p></p>
          </roleplay>
          <roleplay title="A3" id="A3" data-line="14">
            <p></p>
          </roleplay>
          <trigger data-line="16">end</trigger>
        </quest>`)('quest > :first-child');

      const crawler = new Crawler();
      crawler.crawl(new ParserNode(xml, defaultQuestContext()));

      expect(crawler.getStatsForLine(14)).toEqual(jasmine.objectContaining({
        minPathActions: 1,
        maxPathActions: 2,
      }));
    });
  });

  describe('getIds/getLines', () => {
    const xml = cheerio.load('<roleplay title="A1" id="A1" data-line="2"><p></p></roleplay><roleplay title="A2" id="A2" data-line="4"><p></p></roleplay><roleplay title="A3" id="A3" data-line="6"><p></p></roleplay><trigger data-line="8">end</trigger>')(':first-child');

    it('gets ids seen', () => {
      const crawler = new Crawler();
      crawler.crawl(new ParserNode(xml, defaultQuestContext()));

      expect(crawler.getIds().sort()).toEqual(['A1', 'A2', 'A3']);
    });

    it('gets lines seen', () => {
      const crawler = new Crawler();
      crawler.crawl(new ParserNode(xml, defaultQuestContext()));

      expect(crawler.getLines().sort()).toEqual([2, 4, 6]);
    });
  });
});

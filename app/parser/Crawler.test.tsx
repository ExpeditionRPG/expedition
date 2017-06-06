import {Crawler} from './Crawler'
import {ParserNode} from './Node'
import {defaultQuestContext} from '../reducers/QuestTypes'

declare var global: any;

var cheerio: any = require('cheerio');
var window: any = cheerio.load('<div>');

fdescribe('Crawler', () => {
  describe('crawl', () => {

    it('travels across combat events', () => {
      const xml = cheerio.load(`
        <combat data-line="0">
          <event on="win" heal="5" loot="false" xp="false">
            <roleplay id="test" data-line="1">test</roleplay>
            <trigger>end</trigger>
          </event>
          <event on="lose">
            <roleplay id="test2" data-line="2">test 2</roleplay>
            <trigger>end</trigger>
          </event>
        </combat>
      `)('combat');
      const crawler = new Crawler();
      crawler.crawl(new ParserNode(xml, defaultQuestContext()));

      const stats = crawler.getStatsForId('test');
      const prevLine = JSON.parse(Array.from(stats.resultOf)[0]).line;

      expect(prevLine).toEqual(0);
      expect(Array.from(stats.causeOf)).toEqual(['END']);

      const stats2 = crawler.getStatsForId('test2');
      expect(Array.from(stats2.causeOf)).toEqual(['END']);
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
      expect(Array.from(crawler.getStatsForId('A1').causeOf)).toEqual(['END']);
    });
    it('does not follow conditionally false choices');
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

      expect(Array.from(crawler.getStatsForId('B4').causeOf)).toEqual(['END']);
    });
    it('tracks implicit end triggers', () => {
      const xml = cheerio.load(`<roleplay title="A1" id="A1" data-line="2"><p></p></roleplay>`)(':first-child');
      const crawler = new Crawler();
      crawler.crawl(new ParserNode(xml, defaultQuestContext()));

      expect(Array.from(crawler.getStatsForId('A1').causeOf)).toEqual(['IMPLICIT_END']);
    });
    it('safely handles nodes without line annotations', () => {
      const xml = cheerio.load(`<roleplay title="A0" id="A0" data-line="2"><p></p></roleplay><roleplay title="A1" id="A1"><p></p></roleplay><roleplay title="A2"><p></p></roleplay>`)(':first-child');

      const crawler = new Crawler();
      crawler.crawl(new ParserNode(xml, defaultQuestContext()));

      expect(crawler.getIds()).toEqual(['A0']);
      expect(crawler.getLines()).toEqual([2]);
    });
    it('handles hanging choice node with no body');
    it('handles goto with no root <quest> node');
    it('can crawl from root quest node');
  });

  describe('getStatsForId', () => {
    it('gets stats for tag with id', () => {
      const xml = cheerio.load(`<roleplay title="A1" id="A1" data-line="2"><p></p></roleplay>`)(':first-child');
      const crawler = new Crawler();
      crawler.crawl(new ParserNode(xml, defaultQuestContext()));

      expect(crawler.getStatsForId('A1')).toBeDefined();
    });
    it('aggregates stats on non-id tags until next id');
  });

  describe('getStatsForLine', () => {
    it('gets stats for tag with line data', () => {
      const xml = cheerio.load(`<roleplay title="A1" id="A1" data-line="2"><p></p></roleplay>`)(':first-child');
      const crawler = new Crawler();
      crawler.crawl(new ParserNode(xml, defaultQuestContext()));

      expect(crawler.getStatsForLine(2)).toBeDefined();
    });

    it('condenses multiple identical causeOf/resultOf entries');

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

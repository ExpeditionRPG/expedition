import {Context, defaultContext} from './Context';
import {CrawlEntry, CrawlerBase, CrawlEvent} from './Crawler';
import {Node} from './Node';

const cheerio: any = require('cheerio');

class CrawlTest extends CrawlerBase<Context> {
  public efn: ((q: CrawlEntry<Context>, e: CrawlEvent) => any)|null;
  public nfn: ((q: CrawlEntry<Context>, nodeStr: string, id: string, line: number) => any)|null;

  constructor(onEvent: ((q: CrawlEntry<Context>, e: CrawlEvent) => any)|null,
              onNode: ((q: CrawlEntry<Context>, nodeStr: string, id: string, line: number) => any)|null,
              onErrors: ((q: CrawlEntry<Context>, errors: Error[], line: number) => any)|null) {
    super();
    this.efn = onEvent;
    this.nfn = onNode;
    this.wfn = onErrors;
  }

  protected onEvent(q: CrawlEntry<Context>, e: CrawlEvent) {
    if (this.efn) {
      this.efn(q, e);
    }
  }
  protected onNode(q: CrawlEntry<Context>, nodeStr: string, id: string, line: number) {
    if (this.nfn) {
      this.nfn(q, nodeStr, id, line);
    }
  }
  protected onErrors(q: CrawlEntry<Context>, errors: Error[], line: number) {
    if (this.wfn) {
      this.wfn(q, errors, line);
    }
  }
}

describe('CrawlerBase', () => {
  describe('crawl', () => {
    test('travels across combat events', () => {
      const xml = cheerio.load(`
        <combat data-line="0">
          <event on="win" heal="5" loot="false" xp="false">
            <roleplay id="test" data-line="1">test</roleplay>
            <trigger data-line="11">end</trigger>
          </event>
        </combat>
      `)('combat');

      let foundEnd = false;
      const crawler = new CrawlTest((q: CrawlEntry<Context>, e: CrawlEvent) => {
        foundEnd = foundEnd || (e === 'END' && q.prevLine === 1 && q.prevId === 'test');
        expect(e).not.toEqual('IMPLICIT_END');
        expect(e).not.toEqual('INVALID');
      }, null, null);
      crawler.crawl(new Node(xml, defaultContext()));

      expect(foundEnd).toEqual(true);
    });

    test('handles a roleplay node', () => {
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

      let foundEnd = false;
      const crawler = new CrawlTest((q: CrawlEntry<Context>, e: CrawlEvent) => {
        foundEnd = foundEnd || (e === 'END' && q.prevLine === 2 && q.prevId === 'A1');
        expect(e).not.toEqual('IMPLICIT_END');
        expect(e).not.toEqual('INVALID');
      }, (q: CrawlEntry<Context>, nodeStr: string, id: string, line: number) => {
        expect(line).not.toEqual(12);
      }, null);
      crawler.crawl(new Node(xml, defaultContext()));

      expect(foundEnd).toEqual(true);
    });

    test('handles gotos', () => {
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
      let foundEnd = false;
      const crawler = new CrawlTest((q: CrawlEntry<Context>, e: CrawlEvent) => {
        foundEnd = foundEnd || (e === 'END' && q.prevLine === 6 && q.prevId === 'B4');
        expect(e).not.toEqual('IMPLICIT_END');
        expect(e).not.toEqual('INVALID');
      }, null, null);
      crawler.crawl(new Node(xml, defaultContext()));

      expect(foundEnd).toEqual(true);
    });

    test('handles bad gotos', () => {
      const xml = cheerio.load(`<quest>
        <roleplay data-line="0"></roleplay>
        <trigger data-line="1">goto nonexistant_id</trigger>
        <trigger data-line="2">end</trigger>
      </quest>`)('quest > :first-child');
      let foundImplicitEnd = false;
      const crawler = new CrawlTest((q: CrawlEntry<Context>, e: CrawlEvent) => {
        foundImplicitEnd = foundImplicitEnd || (e === 'IMPLICIT_END' && q.prevLine === 0 && q.prevId === 'START');
        expect(e).not.toEqual('END');
        expect(e).not.toEqual('INVALID');
      }, null, null);
      crawler.crawl(new Node(xml, defaultContext()));

      expect(foundImplicitEnd).toEqual(true);
    });

    test('tracks implicit end', () => {
      const xml = cheerio.load(`<roleplay title="A1" id="A1" data-line="2"><p></p></roleplay>`)(':first-child');
      let foundImplicitEnd = false;
      const crawler = new CrawlTest((q: CrawlEntry<Context>, e: CrawlEvent) => {
        foundImplicitEnd = foundImplicitEnd || (e === 'IMPLICIT_END' && q.prevLine === 2 && q.prevId === 'A1');
        expect(e).not.toEqual('END');
        expect(e).not.toEqual('INVALID');
      }, null, null);
      crawler.crawl(new Node(xml, defaultContext()));

      expect(foundImplicitEnd).toEqual(true);
    });

    test('safely handles nodes without line annotations', () => {
      const xml = cheerio.load(`
        <roleplay title="A0" id="A0" data-line="2"><p></p></roleplay>
        <roleplay title="A1" id="A1"><p></p></roleplay>
        <roleplay title="A2"><p></p></roleplay>`)(':first-child');
      let foundInvalid = false;
      const crawler = new CrawlTest((q: CrawlEntry<Context>, e: CrawlEvent) => {
        foundInvalid = foundInvalid || (e === 'INVALID' && q.prevLine === 2 && q.prevId === 'A0');

        // We don't traverse past.
        expect(q.prevId).not.toEqual('A1');
      }, null, null);
      crawler.crawl(new Node(xml, defaultContext()));

      expect(foundInvalid).toEqual(true);
    });

    test('handles op state', () => {
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

      let foundEnd = false;
      let didLoop = false;
      const crawler = new CrawlTest((q: CrawlEntry<Context>, e: CrawlEvent) => {
        foundEnd = foundEnd || (e === 'END' && q.prevLine === 10 && q.prevId === 'cond');
        expect(e).not.toEqual('IMPLICIT_END');
        expect(e).not.toEqual('INVALID');
      }, (q: CrawlEntry<Context>, nodeStr: string, id: string, line: number) => {
        didLoop = didLoop || (line === 6 && q.prevId === 'cond');
      }, null);
      crawler.crawl(new Node(xml, defaultContext()));

      expect(didLoop).toEqual(true);
      expect(foundEnd).toEqual(true);
    });

    test('bails out of infinite loops', () => {
      const xml = cheerio.load(`
        <quest>
          <roleplay title="I" id="I" data-line="2"><p></p></roleplay>
          <trigger data-line="4">goto I</trigger>
        </quest>`)('quest > :first-child');

      const crawler = new CrawlTest(null, null, null);

      // If crawl exits, we'll have succeeded.
      crawler.crawl(new Node(xml, defaultContext()));
    });

    test('notifies on max depth exceeded', () => {
      const xml = cheerio.load(`
        <quest>
          <roleplay title="I" id="I" data-line="2"><p></p></roleplay>
          <trigger data-line="4">goto I</trigger>
        </quest>`)('quest > :first-child');

      let foundExceeded = false;
      const crawler = new CrawlTest((q: CrawlEntry<Context>, e: CrawlEvent) => {
        foundExceeded = foundExceeded || (e === 'MAX_DEPTH_EXCEEDED');
      }, null, null);
      crawler.crawl(new Node(xml, defaultContext()), 500, 1, 150);
      expect(foundExceeded).toEqual(true);
    });

    test('notifies on max visit limit exceeded', () => {
      const xml = cheerio.load(`
        <quest>
          <roleplay title="I" id="I" data-line="2"><p></p></roleplay>
          <trigger data-line="4">goto I</trigger>
        </quest>`)('quest > :first-child');

      let foundExceeded = false;
      const crawler = new CrawlTest((q: CrawlEntry<Context>, e: CrawlEvent) => {
        foundExceeded = foundExceeded || (e === 'VISIT_LIMIT_EXCEEDED');
      }, null, null);
      crawler.crawl(new Node(xml, defaultContext()), 500, 150, 1);
      expect(foundExceeded).toEqual(true);
    });

    test('bails out of computationally expensive quests', () => {
      const xml = cheerio.load(`
        <quest>
          <roleplay title="I" id="I" data-line="2"><p></p></roleplay>
          <trigger data-line="4">goto I</trigger>
        </quest>`)('quest > :first-child');

      const crawler = new CrawlTest(null, null, null);

      // Super-short time limit, super-high depth limit.
      crawler.crawl(new Node(xml, defaultContext()), 1, 1000000);
    });

    test('handles hanging choice node with no body', () => {
      const xml = cheerio.load(`
        <roleplay title="I" data-line="2">
          <choice text="a1"></choice>
        </roleplay>`)(':first-child');
      let foundInvalid = false;
      const crawler = new CrawlTest((q: CrawlEntry<Context>, e: CrawlEvent) => {
        foundInvalid = foundInvalid || (e === 'INVALID' && q.prevLine === 2 && q.prevId === 'START');
      }, null, null);
      crawler.crawl(new Node(xml, defaultContext()));

      expect(foundInvalid).toEqual(true);
    });

    test('handles node without data-line attribute', () => {
      const xml = cheerio.load(`
        <roleplay title="I" data-line="2">
          <choice text="a1"><roleplay></roleplay></choice>
        </roleplay>`)(':first-child');
      let foundInvalid = false;
      const crawler = new CrawlTest((q: CrawlEntry<Context>, e: CrawlEvent) => {
        foundInvalid = foundInvalid || (e === 'INVALID' && q.prevLine === 2 && q.prevId === 'START');
      }, null, null);
      crawler.crawl(new Node(xml, defaultContext()));

      expect(foundInvalid).toEqual(true);
    });

    test('visits other parts of the quest before returning to already-seen lines', () => {
      const xml = cheerio.load(`
        <quest>
          <roleplay data-line="0">{{count = 0}}</roleplay>
          <roleplay id="R1" data-line="1">
            <choice text="a1">
              <roleplay data-line="2">{{count = count + 1}}</roleplay>
              <trigger data-line="3">goto R1</trigger>
            </choice>
            <choice text="a2">
              <roleplay data-line="4">This gets seen before others repeat</roleplay>
            </choice>
            <choice text="a3">
              <roleplay data-line="5">{{count = count + 1}}</roleplay>
              <trigger data-line="6">goto R1</trigger>
            </choice>
          </roleplay>
        </quest>`)('quest > :first-child');
      const uniqueCounter: {[line: number]: boolean} = {};
      const lineOrder: number[] = [];
      const crawler = new CrawlTest(null, (q: CrawlEntry<Context>, nodeStr: string, id: string, line: number) => {
        lineOrder.push(line);
        if (Object.keys(uniqueCounter).length < 5 && uniqueCounter[line]) {
          throw new Error('Came across second instance of line ' + line +
            ' when only ' + Object.keys(uniqueCounter) + ' and not all 0,1,2,4,5 seen. Order: ' + lineOrder);
        }
        uniqueCounter[line] = true;
      }, null);
      crawler.crawl(new Node(xml, defaultContext()));
    });

    test('handles errors in attributes', () => {
      const xml = cheerio.load(`
        <roleplay title="I" data-line="2">
          <choice if="notavar"><roleplay></roleplay></choice>
        </roleplay>`)(':first-child');
      let foundErrors = false;
      const crawler = new CrawlTest(null, null, (q: CrawlEntry<Context>, errors: Error[], line: number) => {
        foundErrors = true;
        expect(errors[0].toString()).toContain('notavar');
        expect(line).toEqual(2);
      });
      crawler.crawl(new Node(xml, defaultContext()));

      expect(foundErrors).toEqual(true);
    });

    test('handles errors in body', () => {
      const xml = cheerio.load(`
        <roleplay title="I" data-line="2">
          <p>{{notavar}}</p>
        </roleplay>`)(':first-child');
      let foundErrors = false;
      const crawler = new CrawlTest(null, null, (q: CrawlEntry<Context>, errors: Error[], line: number) => {
        foundErrors = true;
        expect(errors[0].toString()).toContain('notavar');
        expect(line).toEqual(2);
      });
      crawler.crawl(new Node(xml, defaultContext()));
      expect(foundErrors).toEqual(true);
    });

    test('handles errors in trigger', () => {
      const xml = cheerio.load(`
        <roleplay title="I" data-line="2">
          <trigger>{{notavar}}</trigger>
        </roleplay>`)(':first-child');
      let foundErrors = false;
      const crawler = new CrawlTest(null, null, (q: CrawlEntry<Context>, errors: Error[], line: number) => {
        foundErrors = true;
        expect(errors[0].toString()).toContain('notavar');
        expect(line).toEqual(2);
      });
      crawler.crawl(new Node(xml, defaultContext()));
      expect(foundErrors).toEqual(true);
    });
  });
});

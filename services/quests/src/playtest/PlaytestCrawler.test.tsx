import {defaultContext} from 'shared/parse/Context';
import {Node} from 'shared/parse/Node';
import {Logger, LogMessageMap} from 'shared/render/Logger';
import {PlaytestCrawler} from './PlaytestCrawler';

const expect: any = require('expect');
const cheerio: any = require('cheerio') as CheerioAPI;

function playtestXMLResult(elem: Cheerio): LogMessageMap {
  const crawler = new PlaytestCrawler();
  const logger = new Logger();
  crawler.crawlWithLog(new Node(elem, defaultContext()), logger);
  return logger.getFinalizedLogs();
}

describe('PlaytestCrawler', () => {
  describe('internal-level message', () => {
    test.skip('TODO', () => { /* TODO */ });
  });

  describe('error-level message', () => {
    // TODO: currently nonfunctional, fix is in app
    // it('logs if quest path is broken by bad goto', () => {
//      const msgs = playtestXMLResult(cheerio.load(`<quest>
        // <roleplay data-line="0"></roleplay>
        // <trigger data-line="1" goto="nonexistant_id"></trigger>
        // <roleplay data-line="2"></roleplay>
      // </quest>`)('quest'));
      // expect(msgs.error.length).toEqual(1);
      // expect(msgs.error[0].text).toEqual('An action on this node leads nowhere (invalid goto id or no **end**)');
    // });

    test('logs if a node has an implicit end (no **end** tag)', () => {
      const msgs = playtestXMLResult(cheerio.load(`<quest>
        <roleplay data-line="0"></roleplay>
      </quest>`)('quest > :first-child'));
      expect(msgs.error.length).toEqual(1);
      expect(msgs.error[0].text).toEqual('Choice 0 on this card leads nowhere (invalid goto id or no **end**)');
    });

    test('logs if a combat node has a custom enemy with unspecified tier', () => {
      const msgs = playtestXMLResult(cheerio.load(`<quest>
        <combat data-line="0">
          <e>Custom Enemy</e>
          <event on="win"><trigger>end</trigger></event>
          <event on="lose"><trigger>end</trigger></event>
        </combat>
      </quest>`)('quest > :first-child'));

      expect(msgs.error.length).toEqual(1);
      expect(msgs.error[0].text).toContain('without explicit tier');
    });

    test.skip('logs if a node leads to an invalid node', () => { /* TODO */ });

    test('logs if a node has overlapping conditionally true events', () => {
      const msgs = playtestXMLResult(cheerio.load(`<quest>
        <combat data-line="0">
          <event on="win" if="false"><trigger>end</trigger></event>
          <event on="win" if="true"><trigger>end</trigger></event>
          <event on="win"><trigger>end</trigger></event>
          <event on="lose" if="false"><trigger>end</trigger></event>
        </combat>
      </quest>`)('quest > :first-child'));

      expect(msgs.error.length).toEqual(1);
      expect(msgs.error[0].text).toContain('2 "win" and 0 "lose" events');
    });

    test.skip('logs if a node contains an [art] tag not on its own line', () => { /* TODO */ });

    test.skip('logs if a node has all choices hidden and "Next" is shown', () => { /* TODO */ }); // (correctness depends on user intent here)

    // (E.g. "True" and "TRUE" aren't defined, but "true" is a constant)')
    test.skip('logs if a node has an op parser failure', () => { /* TODO */ });
  });

  describe('warning-level message', () => {
    test.skip('logs if quest length is too varied', () => { /* TODO */ });

    test.skip('logs if a node is not visited', () => { /* TODO */ });

    test.skip('logs if a node has been visited >10x', () => { /* TODO */ });

    test.skip('logs if overall quest length is too varied', () => { /* TODO */ });

    test.skip('logs if overall quest difficulty is way too high', () => { /* TODO */ }); // (e.g. consistently above T6 encounters)

    test.skip('logs if a node has too lengthy dialogue', () => { /* TODO */ });

    // 2 combats back-to-back? bad idea. 3 combats with single cards in between? Also bad idea.
    test.skip('logs if there are too many consecutive combats', () => { /* TODO */ });

    test.skip('logs if there is uneven choice distribution', () => { /* TODO */ }); // (too few/too many, or alternating 0-2-0-2 etc.)

    test.skip('logs if instructions involving loot fail to validate', () => { /* TODO */ });

    test.skip('logs if instructions involving abilities fail to validate', () => { /* TODO */ });

    test.skip('logs if instructions involving health fail to validate', () => { /* TODO */ });

    test.skip('logs if instructions include reference to "player" or "players"', () => { /* TODO */ });
  });

  describe('info-level message', () => {
    test.skip('logs general reading level required for the quest', () => { /* TODO */ });

    test.skip('logs estimated minimum/maximum play time', () => { /* TODO */ });

    test.skip('logs most-visited nodes', () => { /* TODO */ });
  });
});

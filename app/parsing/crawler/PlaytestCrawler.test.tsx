import {playtestXMLResult} from './PlaytestCrawler'
import {QDLParser} from '../QDLParser'

var expect: any = require('expect');
const cheerio: any = require('cheerio') as CheerioAPI;

describe('playtest', () => {
  describe('internal-level message', () => {
  });

  describe('error-level message', () => {
    /* // TODO: currently nonfunctional, fix is in app
    it('logs if quest path is broken by bad goto', () => {
      const msgs = playtestXMLResult(cheerio.load(`<quest>
        <roleplay data-line="0"></roleplay>
        <trigger data-line="1" goto="nonexistant_id"></trigger>
        <roleplay data-line="2"></roleplay>
      </quest>`)('quest'));

      expect(msgs.error.length).toEqual(1);
      expect(msgs.error[0].text).toEqual('An action on this node leads nowhere (invalid goto id or no **end**)');
    }); */

    it('logs if a node has an implicit end (no **end** tag)', () => {
      /*
      const msgs = playtestXMLResult(cheerio.load(`<quest>
        <roleplay data-line="0"></roleplay>
      </quest>`)('quest'));

      expect(msgs.error.length).toEqual(1);
      expect(msgs.error[0].text).toEqual('An action on this card leads nowhere (invalid goto id or no **end**)');*/
    });

    it('logs if a node leads to an invalid node');

    it('logs if a node has overlapping conditionally true events', () => {
      /*
      const msgs = playtestXMLResult(cheerio.load(`<quest>
        <combat data-line="0">
          <event on="win" if="false"><trigger>end</trigger></event>
          <event on="win" if="true"><trigger>end</trigger></event>
          <event on="win"><trigger>end</trigger></event>
          <event on="lose" if="false"><trigger>end</trigger></event>
        </combat>
      </quest>`)('quest'));

      expect(msgs.error.length).toEqual(1);
      expect(msgs.error[0].text).toContain('could have 2 "win" event(s) and 1 "lose" events');
      */
    });

    it('logs if a node has all choices hidden and "Next" is shown', () => {

    }); // (correctness depends on user intent here)

    it('logs if a node has an op parser failure'); // (E.g. "True" and "TRUE" aren't defined, but "true" is a constant)')
  });

  describe('warning-level message', () => {
    it('logs if quest length is too varied');

    it('logs if a node is not visited');

    it('logs if a node has been visited >10x');

    it('logs if overall quest length is too varied');

    it('logs if overall quest difficulty is way too high'); // (e.g. consistently above T6 encounters)

    it('logs if a node has too lengthy dialogue');

    it('logs if there are too many consecutive combats'); // 2 combats back-to-back? bad idea. 3 combats with single cards in between? Also bad idea.

    it('logs if there is uneven choice distribution') // (too few/too many, or alternating 0-2-0-2 etc.)
  });

  describe('info-level message', () => {
    it('logs if quest is unparseable', () => {
      const msgs = playtestXMLResult(null);
      expect(msgs.info.length).toEqual(1);
      expect(msgs.info[0].text).toEqual('Auto-Playtest failed (likely a parser error)');
    });

    it('logs general reading level required for the quest');

    it('logs estimated minimum/maximum play time');

    it('logs most-visited nodes');
  });
});

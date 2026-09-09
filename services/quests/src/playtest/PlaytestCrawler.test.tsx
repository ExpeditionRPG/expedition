import { defaultContext } from 'shared/parse/Context';
import { Node } from 'shared/parse/Node';
import { Logger, LogMessageMap } from 'shared/render/Logger';
import { PlaytestCrawler } from './PlaytestCrawler';

import * as cheerio from 'shared/Cheerio';

function playtestXMLResult(elem: Cheerio): LogMessageMap {
  const crawler = new PlaytestCrawler();
  const logger = new Logger();
  crawler.crawlWithLog(new Node(elem, defaultContext()), logger);
  return logger.getFinalizedLogs();
}

describe('PlaytestCrawler', () => {
  describe('error-level message', () => {
    test('logs if a node has an implicit end (no **end** tag)', () => {
      const msgs = playtestXMLResult(
        cheerio.load(`<quest>
        <roleplay data-line="0"></roleplay>
      </quest>`)('quest > :first-child'),
      );
      expect(msgs.error.length).toEqual(1);
      expect(msgs.error[0].text).toEqual(
        'Choice 0 on this card leads nowhere (invalid goto id or no **end**)',
      );
    });

    test('logs if a combat node has a custom enemy with unspecified tier', () => {
      const msgs = playtestXMLResult(
        cheerio.load(`<quest>
        <combat data-line="0">
          <e>Custom Enemy</e>
          <event on="win"><trigger data-line="99">end</trigger></event>
          <event on="lose"><trigger data-line="99">end</trigger></event>
        </combat>
      </quest>`)('quest > :first-child'),
      );

      expect(msgs.error.length).toEqual(1);
      expect(msgs.error[0].text).toContain('without explicit tier');
    });

    test('records invalid transitions for empty choices', () => {
      const crawler = new PlaytestCrawler();
      crawler.crawlWithLog(
        new Node(
          cheerio.load(
            '<roleplay data-line="0"><choice text="Empty"/></roleplay>',
          )('roleplay'),
          defaultContext(),
        ),
        new Logger(),
      );
      expect(crawler.getStatsByEvent('INVALID')).toEqual([
        expect.objectContaining({ line: 0 }),
      ]);
    });

    test('logs if a node has overlapping conditionally true events', () => {
      const msgs = playtestXMLResult(
        cheerio.load(`<quest>
        <combat data-line="0">
          <event on="win" if="false"><trigger data-line="99">end</trigger></event>
          <event on="win" if="true"><trigger data-line="99">end</trigger></event>
          <event on="win"><trigger data-line="99">end</trigger></event>
          <event on="lose" if="false"><trigger data-line="99">end</trigger></event>
        </combat>
      </quest>`)('quest > :first-child'),
      );

      expect(msgs.error.length).toEqual(1);
      expect(msgs.error[0].text).toContain('2 "win" and 0 "lose" events');
    });

    test('logs if a node contains an [art] tag not on its own line', () => {
      const msgs = playtestXMLResult(
        cheerio.load(
          '<quest><roleplay data-line="0"><p>Text [art]</p></roleplay><trigger data-line="99">end</trigger></quest>',
        )('quest > :first-child'),
      );
      expect(msgs.error).toEqual([
        expect.objectContaining({
          url: '435',
          text: '[art] should be on its own line',
        }),
      ]);
    });

    test('logs if a node has all choices hidden and "Next" is shown', () => {
      const msgs = playtestXMLResult(
        cheerio.load(
          '<quest><roleplay data-line="0"><choice if="false"><trigger data-line="99">end</trigger></choice></roleplay><trigger data-line="99">end</trigger></quest>',
        )('quest > :first-child'),
      );
      expect(msgs.error).toEqual([expect.objectContaining({ url: '432' })]);
    }); // (correctness depends on user intent here)

    // (E.g. "True" and "TRUE" aren't defined, but "true" is a constant)')
    test('logs if a node has an op parser failure', () => {
      const msgs = playtestXMLResult(
        cheerio.load(
          '<quest><roleplay data-line="0"><p>{{undefinedVariable + 1}}</p></roleplay><trigger data-line="99">end</trigger></quest>',
        )('quest > :first-child'),
      );
      expect(msgs.error).toEqual([
        expect.objectContaining({
          url: '427',
          text: expect.stringContaining('undefinedVariable'),
        }),
      ]);
    });

    test('logs if a node is in a nested combat', () => {
      const msgs = playtestXMLResult(
        cheerio.load(`<quest>
        <combat data-line="0">
          <e>Giant Rat</e>
          <event on="round">
            <roleplay data-line="5">
              <choice>
                <combat data-line="10">
                  <e>Giant Rat</e>
                  <event on="win"><trigger data-line="99">end</trigger></event>
                  <event on="lose"><trigger data-line="99">end</trigger></event>
                </combat>
              </choice>
            </roleplay>
          </event>
          <event on="win"><trigger data-line="99">end</trigger></event>
          <event on="lose"><trigger data-line="99">end</trigger></event>
        </combat>
      </quest>`)('quest > :first-child'),
      );
      expect(msgs.error.length).toEqual(1);
      expect(msgs.error[0].text).toContain('from this combat to another');
    });

    test('logs when jumping from a combat to a different combat', () => {
      const msgs = playtestXMLResult(
        cheerio.load(`<quest>
        <combat data-line="0">
          <e>Giant Rat</e>
          <event on="round">
            <roleplay data-line="3">
              <choice>
                <trigger>goto c2</trigger>
              </choice>
            </roleplay>
          </event>
          <event on="win"><trigger data-line="99">end</trigger></event>
          <event on="lose"><trigger data-line="99">end</trigger></event>
        </combat>
        <combat data-line="5" id="c2">
          <e>Giant Rat</e>
          <event on="win"><trigger data-line="99">end</trigger></event>
          <event on="lose"><trigger data-line="99">end</trigger></event>
        </combat>
      </quest>`)('quest > :first-child'),
      );
      expect(msgs.error.length).toEqual(1);
      expect(msgs.error[0].text).toContain('from this combat to another');
    });

    test('does not log when transitioning regularly to an adjacent combat', () => {
      const msgs = playtestXMLResult(
        cheerio.load(`<quest>
        <combat data-line="0">
          <e>Giant Rat</e>
          <event on="win"><roleplay><p></p></roleplay></event>
          <event on="lose"><roleplay><p></p></roleplay></event>
        </combat>
        <combat data-line="5" id="c2">
          <e>Giant Rat</e>
          <event on="win"><trigger data-line="99">end</trigger></event>
          <event on="lose"><trigger data-line="99">end</trigger></event>
        </combat>
      </quest>`)('quest > :first-child'),
      );
      expect(msgs.error.length).toEqual(0);
    });
  });

  describe('warning-level message', () => {
    test('logs if warnings were detected in the parser node logic', () => {
      const msgs = playtestXMLResult(
        cheerio.load(`<quest>
        <roleplay data-line="2">
          <choice if="notavar"><roleplay></roleplay></choice>
        </roleplay>
        <trigger data-line="99">end</trigger>
      </quest>`)('quest > :first-child'),
      );

      expect(msgs.error.length).toEqual(1);
      expect(msgs.error[0].text).toContain('notavar');
    });

    test('records reachable lines and excludes unreachable nodes', () => {
      const crawler = new PlaytestCrawler();
      const logger = new Logger();
      crawler.crawlWithLog(
        new Node(
          cheerio.load(
            '<quest><roleplay id="start" data-line="0"><choice><trigger data-line="99">end</trigger></choice><choice if="false"><roleplay data-line="9"/></choice></roleplay></quest>',
          )('quest > :first-child'),
          defaultContext(),
        ),
        logger,
      );
      expect(crawler.getLines()).toEqual([0]);
      expect(Array.from(crawler.getStatsForId('start').outputs)).toEqual([
        'END',
      ]);
      expect(logger.getFinalizedLogs().warning).toEqual([]);
    });
    test('bounds repeated visits without warning about author-intended loops', () => {
      const crawler = new PlaytestCrawler();
      const logger = new Logger();
      const result = crawler.crawlWithLog(
        new Node(
          cheerio.load(
            '<quest><roleplay id="loop" data-line="0"><p>Repeat</p></roleplay><trigger>goto loop</trigger></quest>',
          )('quest > :first-child'),
          defaultContext(),
        ),
        logger,
      );
      expect(result[0]).toBe(0);
      expect(crawler.getLines()).toEqual([0]);
      expect(logger.getFinalizedLogs().warning).toEqual([]);
    });
    // Difficulty, dialogue-length, choice-balance and consecutive-combat heuristics are not implemented.
    test('logs if instructions involving loot fail to validate', () => {
      const msgs = playtestXMLResult(
        cheerio.load(
          '<quest><roleplay data-line="0"><instruction>You get a loot</instruction></roleplay><trigger data-line="99">end</trigger></quest>',
        )('quest > :first-child'),
      );
      expect(msgs.warning).toEqual([
        expect.objectContaining({
          url: '434',
          text: expect.stringContaining('Loot-affecting'),
        }),
      ]);
    });

    test('logs if instructions involving abilities fail to validate', () => {
      const msgs = playtestXMLResult(
        cheerio.load(
          '<quest><roleplay data-line="0"><instruction>Gain 2 abilities</instruction></roleplay><trigger data-line="99">end</trigger></quest>',
        )('quest > :first-child'),
      );
      expect(msgs.warning).toEqual([
        expect.objectContaining({
          url: '434',
          text: expect.stringContaining('Ability-affecting'),
        }),
      ]);
    });

    test('logs if instructions involving health fail to validate', () => {
      const msgs = playtestXMLResult(
        cheerio.load(
          '<quest><roleplay data-line="0"><instruction>Heal 5 hp</instruction></roleplay><trigger data-line="99">end</trigger></quest>',
        )('quest > :first-child'),
      );
      expect(msgs.warning).toEqual([
        expect.objectContaining({
          url: '434',
          text: expect.stringContaining('Health-affecting'),
        }),
      ]);
    });

    test('logs if instructions include reference to "player" or "players"', () => {
      const msgs = playtestXMLResult(
        cheerio.load(
          '<quest><roleplay data-line="0"><instruction>Each player draws a card</instruction></roleplay><trigger data-line="99">end</trigger></quest>',
        )('quest > :first-child'),
      );
      expect(msgs.warning).toEqual([
        expect.objectContaining({
          url: '435',
          text: expect.stringContaining('adventurer'),
        }),
      ]);
    });
  });

  // Reading-level and elapsed-play-time estimates never shipped; crawl stats are the supported API.
  test('exposes visited-node and path-length statistics without fabricated reading/time estimates', () => {
    const crawler = new PlaytestCrawler();
    const logger = new Logger();
    crawler.crawlWithLog(
      new Node(
        cheerio.load(
          '<quest><roleplay id="start" data-line="0"><p>Read this</p></roleplay><roleplay id="finish" data-line="1"><p>Done</p></roleplay><trigger data-line="99">end</trigger></quest>',
        )('quest > :first-child'),
        defaultContext(),
      ),
      logger,
    );
    expect(crawler.getIds()).toEqual(['start', 'finish']);
    const stats = crawler.getStatsForId('finish');
    expect(stats.numInternalStates).toBeGreaterThan(0);
    expect(stats.maxPathActions).toBeGreaterThanOrEqual(stats.minPathActions);
    expect(Array.from(stats.outputs)).toEqual(['END']);
    expect(logger.getFinalizedLogs().info).toEqual([]);
  });
});

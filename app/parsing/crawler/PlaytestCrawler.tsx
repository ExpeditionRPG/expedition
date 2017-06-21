import {CrawlEvent, CrawlEntry} from 'expedition-app/app/parser/Crawler'
import {defaultQuestContext} from 'expedition-app/app/reducers/QuestTypes'
import {StatsCrawler} from './StatsCrawler'
import {ParserNode} from 'expedition-app/app/parser/Node'
import {Logger, LogMessageMap} from '../Logger'
import {initQuest} from 'expedition-app/app/actions/Quest'

const cheerio: any = require('cheerio') as CheerioAPI;

// Surfaces errors, warnings, statistics, and other useful information
// about particular states encountered during play through the quest, or
// about the quest in aggregate.
class PlaytestCrawler extends StatsCrawler {
  private logger: Logger;
  private finalized: LogMessageMap;

  constructor(logger: Logger) {
    super()
    this.logger = logger;
  }

  public crawl(node: ParserNode) {
    super.crawl(node);

    // TODO: We'll probably write a DFS here that traverses the
    // CrawlerStats entries (e.g. for cycle detection)

    // Create gutter errors.
    for (let l of this.statsByEvent['IMPLICIT_END'].lines) {
      this.logger.err('An action on this card leads nowhere (invalid goto id or no **end**)', '430', l);
    }
  }

  // override onNode to track specific per-node bad events
  protected onNode(q: CrawlEntry, nodeStr: string, id: string, line: number): void {
    super.onNode(q, nodeStr, id, line);

    const keys = q.node.getVisibleKeys();
    const tag = q.node.getTag();

    switch (tag) {
      case 'combat':
        const winCount = keys.reduce((acc: number, k: string) => {
          return acc + ((k === 'win') ? 1 : 0);
        }, 0);
        const loseCount = keys.reduce((acc: number, k: string) => {
          return acc + ((k === 'lose') ? 1 : 0);
        }, 0);
        if (winCount !== 1 || loseCount !== 1) {
          this.logger.err('Detected a state where this card has ' + winCount +
            ' "win" and ' + loseCount + ' "lose" events; want 1 and 1', '431', line);
        }
        break;
      case 'roleplay':
        let choiceCount = 0;
        q.node.loopChildren((tag, child, orig) => {
          choiceCount += (tag === 'choice') ? 1 : 0;
        });
        if (keys.length === 0 && choiceCount > 0) {
          this.logger.err('Detected a state where this card has 0 active choices', '432', line);
        }
        break;
      default:
        break;
    }
  }
}

export function playtestXMLResult(parserResult: Cheerio): LogMessageMap {
  const logger = new Logger();
  try {
    const root = initQuest('0', parserResult, defaultQuestContext()).node;
    const crawler = new PlaytestCrawler(logger);
    crawler.crawl(root);
  } catch(e) {
    logger.dbg('Auto-Playtest failed (likely a parser error)');
  } finally {
    return logger.getFinalizedLogs();
  }
}

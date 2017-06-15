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

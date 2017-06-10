import {CrawlEvent, CrawlEntry} from 'expedition-app/app/parser/Crawler'
import {defaultQuestContext} from 'expedition-app/app/reducers/QuestTypes'
import {StatsCrawler} from './StatsCrawler'
import {ParserNode} from 'expedition-app/app/parser/Node'
import {LogMessageMap} from '../Logger'

const cheerio: any = require('cheerio') as CheerioAPI;

// Surfaces errors, warnings, statistics, and other useful information
// about particular states encountered during play through the quest, or
// about the quest in aggregate.
class PlaytestCrawler extends StatsCrawler {

  public crawl(node: ParserNode) {
    super.crawl(node);
    // TODO: Calculate and log aggregate stats.
    // This *may* require writing a DFS that traverses the CrawlerStats entries (to do cycle detection, for instance)
  }

  protected onEvent(q: CrawlEntry, e: CrawlEvent): void {

  };

  protected onNode(q: CrawlEntry, nodeStr: string, id: string, line: number): void {
    // TODO: All the gooey internal shiz.
  }

  public getFinalizedMessages(): LogMessageMap {
    return null;
  }
}

// TODO: Error and don't show stats calculations if an invalid node was discovered.
export function playtest(elem: CheerioElement): LogMessageMap {
  /*
  const root = new ParserNode(cheerio.load(xml)('quest > :first-child'), defaultQuestContext());
  const crawler = new PlaytestCrawler();
  crawler.crawl(root);
  return crawler.getFinalizedMessages();
  */
  return null;
}

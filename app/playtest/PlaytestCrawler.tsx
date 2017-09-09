import {CrawlEvent, CrawlEntry} from 'expedition-qdl/lib/parse/Crawler'
import {StatsCrawler, StatsCrawlEntry} from './StatsCrawler'
import {ParserNode} from 'expedition-app/app/cardtemplates/Template'
import {Logger, LogMessageMap} from 'expedition-qdl/lib/render/Logger'
import {initQuest} from 'expedition-app/app/actions/Quest'
import {encounters} from 'expedition-app/app/Encounters'

const cheerio: any = require('cheerio') as CheerioAPI;

// Surfaces errors, warnings, statistics, and other useful information
// about particular states encountered during play through the quest, or
// about the quest in aggregate.
export class PlaytestCrawler extends StatsCrawler {
  private logger: Logger;
  private finalized: LogMessageMap;

  constructor(logger: Logger) {
    super()
    this.logger = logger;
  }

  public crawlWithLog(node: ParserNode, logger: Logger): boolean {
    if (logger) {
      this.logger = logger;
    }
    const isDone = this.crawl(node);

    // TODO: We'll probably write a DFS here that traverses the
    // CrawlerStats entries (e.g. for cycle detection)

    // Create gutter errors.
    for (let l of this.statsByEvent['IMPLICIT_END'].lines) {
      this.logger.err('An action on this card leads nowhere (invalid goto id or no **end**)', '430', l);
    }
    return isDone;
  }

  // override onNode to track specific per-node bad events
  protected onNode(q: StatsCrawlEntry, nodeStr: string, id: string, line: number): void {
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

        // Check that enemies are all valid or have tier overrides set.
        q.node.loopChildren((tag, child, orig) => {
          if (tag !== 'e') {
            return;
          }
          if (!encounters[child.text()] && !child.attr('tier')) {
            this.logger.err('Detected a non-standard enemy "' + child.text() + '" without explicit tier JSON', '419', line);
          }
        });
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

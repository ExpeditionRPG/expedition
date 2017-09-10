import {CrawlEvent, CrawlEntry} from 'expedition-qdl/lib/parse/Crawler'
import {Context} from 'expedition-qdl/lib/parse/Context'
import {StatsCrawler, StatsCrawlEntry} from './StatsCrawler'
import {Node} from 'expedition-qdl/lib/parse/Node'
import {Logger, LogMessageMap} from 'expedition-qdl/lib/render/Logger'
import {initQuest} from 'expedition-app/app/actions/Quest'
import {encounters} from 'expedition-app/app/Encounters'

const cheerio: any = require('cheerio') as CheerioAPI;

// Validators for instructions - these look at the preceeding 2 words
// and expect a <verb> <count> <type> format, where <verb> is something like "gain" or "lose",
// <count> is a positive integer, and <type> is any of ability/health/loot.
// These matches are case insensitive and global, using the /gi suffix.
const HEALTH_INSTRUCTION = /(\w+ \w+ (health|hp))/gi;
const VALID_HEALTH_INSTRUCTION = /((gain|lose) \d+ health)/i;
const ABILITY_INSTRUCTION = /(\w+ \w+ abili(ty|ties))/gi;
const VALID_ABILITY_INSTRUCTION = /((learn|discard) \d+ abili(ty|ties))/i;
const LOOT_INSTRUCTION = /(\w*\s*\w*\s*\w+ \w+ loot)/gi;
const VALID_LOOT_INSTRUCTION = /((draw|discard) \d+ tier (I|II|III|IV|V) loot)|(discard \d+ loot)/i;

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

  public crawlWithLog(node: Node<Context>, logger: Logger): [number, number] {
    if (logger) {
      this.logger = logger;
    }
    this.crawl(node);

    // TODO: We'll probably write a DFS here that traverses the
    // CrawlerStats entries (e.g. for cycle detection)

    // Create gutter errors.
    for (let l of this.statsByEvent['IMPLICIT_END'].lines) {
      this.logger.err('An action on this card leads nowhere (invalid goto id or no **end**)', '430', l);
    }
    return [this.queue.length, this.seen.size];
  }

  // override onNode to validate each node as we see them.
  protected onNode(q: StatsCrawlEntry, nodeStr: string, id: string, line: number): void {
    super.onNode(q, nodeStr, id, line);

    switch (q.node.getTag()) {
      case 'combat':
        this.verifyCombatEventCounts(q.node, line);
        this.verifyEnemyTiers(q.node, line);
        break;
      case 'roleplay':
        this.verifyChoiceCount(q.node, line);
        this.verifyInstructionFormat(q.node, line);
        break;
      default:
        break;
    }
  }

  private verifyCombatEventCounts(combatNode: Node<Context>, line: number) {
    const keys = combatNode.getVisibleKeys();
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
  }

  private verifyEnemyTiers(combatNode: Node<Context>, line: number) {
    // Check that enemies are all valid or have tier overrides set.
    combatNode.loopChildren((tag, child, orig) => {
      if (tag !== 'e') {
        return;
      }
      if (!encounters[child.text().toLowerCase()] && !child.attr('tier')) {
        this.logger.err('Detected a non-standard enemy "' + child.text() + '" without explicit tier JSON', '419', line);
      }
    });
  }

  private verifyChoiceCount(roleplayNode: Node<Context>, line: number) {
    let choiceCount = 0;
    roleplayNode.loopChildren((tag, child, orig) => {
      choiceCount += (tag === 'choice') ? 1 : 0;
    });
    const keys = roleplayNode.getVisibleKeys();
    if (keys.length === 0 && choiceCount > 0) {
      this.logger.err('Detected a state where this card has 0 active choices', '432', line);
    }
  }

  private verifyInstructionFormat(roleplayNode: Node<Context>, line: number) {
    roleplayNode.loopChildren((tag, child, orig) => {
      if (tag !== 'instruction') {
        return;
      }
      const inst = child.text();
      for (let m of (inst.match(HEALTH_INSTRUCTION) || [])) {
        if (!m.match(VALID_HEALTH_INSTRUCTION)) {
          this.logger.warn('Health-affecting instructions should\nfollow the format "Gain/Lose <number> Health",\ninstead saw "' + m + '"', '434', line);
        }
      }
      for (let m of (inst.match(ABILITY_INSTRUCTION) || [])) {
        if (!m.match(VALID_ABILITY_INSTRUCTION)) {
          this.logger.warn('Ability-affecting instructions should\nfollow the format "Learn/Discard <number> Abilit(y/ies)",\ninstead saw "' + m + '"', '434', line);
        }
      }
      for (let m of (inst.match(LOOT_INSTRUCTION) || [])) {
        if (!m.match(VALID_LOOT_INSTRUCTION)) {
          this.logger.warn('Loot-affecting instructions should\nread as follows: "Draw 1 Tier IV Loot",\ninstead saw "' + m + '"', '434', line);
        }
      }
    });
  }
}

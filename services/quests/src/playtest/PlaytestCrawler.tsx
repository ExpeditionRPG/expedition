import {ENCOUNTERS} from 'app/Encounters';
import {Context} from 'shared/parse/Context';
import {Node} from 'shared/parse/Node';
import {REGEX} from 'shared/Regex';
import {Logger} from 'shared/render/Logger';
import {PlaytestSettings} from '../reducers/StateTypes';
import {StatsCrawlEntry, StatsCrawler} from './StatsCrawler';

// Validators for instructions - these look at the preceeding 2 words
// and expect a <verb> <count> <type> format, where <verb> is something like "gain" or "lose",
// <count> is a positive integer, and <type> is any of ability/health/loot.
// These matches are case insensitive and global, using the /gi suffix.
const HEALTH_INSTRUCTION = /(\w+ \w+ (health|hp))/gi;
const VALID_HEALTH_INSTRUCTION = /(([gG]ain|[lL]ose) (all|\d+) health)/;
const ABILITY_INSTRUCTION = /(\w+ \w+ abili(ty|ties))/gi;
const VALID_ABILITY_INSTRUCTION = /(([lL]earn|[dD]iscard) (one|two|three|four|five|six|seven|eight|nine|ten) abili(ty|ties))/;
const LOOT_INSTRUCTION = /(\w*\s*\w*\s*\w+ \w+ loot)/gi;
const VALID_LOOT_INSTRUCTION = /(([dD]raw|[dD]iscard) (one|two|three|four|five|six|seven|eight|nine|ten) tier (I|II|III|IV|V) loot)|(discard \d+ loot)/;
const ADVENTURER_INSTRUCTION = /(\w*\s*player(s?)\s*\w*)/g;

function getCombatParent(node: Node<Context>): Cheerio|null {
  let e = node.elem.parent();
  while (e.get(0) && e.parent()) {
    const tag = e.get(0).tagName;

    // Don't count being within the win/lose events of a combat node as being "in combat".
    if (tag === 'event' && (e.attr('on') === 'win' || e.attr('on') === 'lose')) {
      return null;
    }

    if (tag === 'combat') {
      return e;
    }
    e = e.parent();
  }
  return null;
}

// Surfaces errors, warnings, statistics, and other useful information
// about particular states encountered during play through the quest, or
// about the quest in aggregate.
export class PlaytestCrawler extends StatsCrawler {
  private logger: Logger;
  private settings: PlaytestSettings;

  constructor(settings?: PlaytestSettings) {
    super();
    this.logger = new Logger();
    this.settings = settings || {} as PlaytestSettings;
  }

  public crawlWithLog(node: Node<Context>|undefined, logger: Logger): [number, number] {
    if (logger) {
      this.logger = logger;
    }
    this.crawl(node);

    // TODO: We'll probably write a DFS here that traverses the
    // CrawlerStats entries (e.g. for cycle detection)

    // Create gutter errors.
    for (const e of this.statsByEvent.IMPLICIT_END) {
      this.logger.err(`Choice ${(typeof(e.fromAction) === 'string') ? '\'' + e.fromAction + '\'' : e.fromAction} on this card leads nowhere (invalid goto id or no **end**)`, '430', e.line);
    }
    return [this.queue.size, this.seen.size];
  }

  // override onNode to validate each node as we see them.
  protected onNode(q: StatsCrawlEntry, nodeStr: string, id: string, line: number): void {
    super.onNode(q, nodeStr, id, line);

    if (!q.node) {
      return;
    }

    switch (q.node.getTag()) {
      case 'combat':
        this.verifyCombatEventCounts(q.node, line);
        this.verifyEnemies(q.node, line);
        break;
      case 'roleplay':
        this.verifyChoiceCount(q.node, line);
        this.verifyInstructionFormat(q.node, line);
        this.verifyRoleplayArt(q.node, line);
        this.verifyMidCombatRoleplayNoJumpToCombat(q.node, line);
        break;
      default:
        break;
    }
  }

  protected onErrors(q: StatsCrawlEntry, errors: Error[], line: number) {
    for (const e of errors) {
      this.logger.err(e.toString(), '427', line);
    }
  }

  private verifyRoleplayArt(roleplayNode: Node<Context>, line: number) {
    roleplayNode.loopChildren((tag, child, orig) => {
      if (tag === 'choice') { // Only validate nodes' direct contents so that formatting is correct
        return;
      }
      const inst = child.text();
      const invalidArt = REGEX.INVALID_ART.exec(inst);
      if (invalidArt) {
        this.logger.err(`[${invalidArt[1]}] should be on its own line`, '435', line);
      }
    });

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

  private verifyEnemies(combatNode: Node<Context>, line: number) {

    combatNode.loopChildren((tag, child, orig) => {
      if (tag !== 'e') {
        return;
      }
      const encounter = ENCOUNTERS[child.text().toLowerCase()];
      // Check that enemies are standard or are custome + have tier overrides set.
      if (!encounter && !child.attr('tier')) {
        this.logger.err('Detected a non-standard enemy "' + child.text() + '" without explicit tier JSON', '419', line);
      }
      // Check that defined, non-base enemies listed do not belong to disabled content sets
      if (encounter && encounter.set !== 'base') {
        if (!this.settings['expansion' + encounter.set]) {
          this.logger.warn(`Detected a ${encounter.set} enemy (${child.text()}) but this quest does not require ${encounter.set} content set.`, '437', line);
        }
      }
    });
  }

  private verifySaveCheck() {
    // TODO: serialize/deserialize the context and warn the user when they're doing something that would
    // cause their quest to fail to save & load.
  }

  private verifyMidCombatRoleplayNoJumpToCombat(roleplayNode: Node<Context>, line: number) {
    const cp1 = getCombatParent(roleplayNode);
    if (!cp1) {
      return;
    }
    const line1 = cp1.attr('data-line');

    const keys = roleplayNode.getVisibleKeys();
    for (const k of (keys.length > 0) ? keys : [0]) {
      const dest = roleplayNode.handleAction(k);
      if (!dest) {
        continue; // This problem (no destination on action) handled elsewhere
      }

      if (keys.length === 0 && dest.elem.prev().attr('data-line') === line1) {
        // If there were no choices from the node and we landed directly on the next node,
        // then we probably are actually just exiting the mid-combat roleplay portion.
        continue;
      }

      const cp2 = (dest.elem.get(0).tagName === 'combat') ? dest.elem : getCombatParent(dest);
      if (cp2 && cp2.attr('data-line') !== line1) {
        this.logger.err('Invalid transition from this combat to another combat (line ' + cp2.attr('data-line') + ')', '427', line);
      }
    }
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
      for (const m of (inst.match(HEALTH_INSTRUCTION) || [])) {
        if (!m.match(VALID_HEALTH_INSTRUCTION)) {
          this.logger.warn('Health-affecting instructions should\nfollow the format "Gain/Lose <number> health",\ninstead saw "' + m + '"', '434', line);
        }
      }
      for (const m of (inst.match(ABILITY_INSTRUCTION) || [])) {
        if (!m.match(VALID_ABILITY_INSTRUCTION)) {
          this.logger.warn('Ability-affecting instructions should\nfollow the format "Learn/Discard <number> abilit(y/ies)",\ninstead saw "' + m + '"', '434', line);
        }
      }
      for (const m of (inst.match(LOOT_INSTRUCTION) || [])) {
        if (!m.match(VALID_LOOT_INSTRUCTION)) {
          this.logger.warn('Loot-affecting instructions should\nread as follows: "Draw (one/two/three/four/five/six) tier (I/II/III/IV/V) loot",\ninstead saw "' + m + '"', '434', line);
        }
      }

      const badPlayerReferences = (inst.match(ADVENTURER_INSTRUCTION) || []).map((m: string) => {
        return '"' + m.replace('"', '\'') + '"';
      }).join(', ');
      if (badPlayerReferences) {
        this.logger.warn('Prefer using "adventurer" over "player"\n(in ' + badPlayerReferences + ')', '435', line);
      }
    });
  }
}

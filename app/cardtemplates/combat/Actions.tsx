import Redux from 'redux'
import {DifficultyType, Enemy, Loot} from '../../reducers/QuestTypes'
import {defaultQuestContext} from '../../reducers/Quest'
import {CombatDifficultySettings, CombatAttack} from './Types'
import {SettingsType} from '../../reducers/StateTypes'
import {ParserNode} from '../../parser/Node'
import {toCard} from '../../actions/Card'
import {encounters} from '../../Encounters'
import {QuestNodeAction} from '../../actions/ActionTypes'

var cheerio: any = require('cheerio');

function getDifficultySettings(difficulty: DifficultyType): CombatDifficultySettings {
  // TODO(semartin): Make this a constant.
  switch(difficulty) {
    case 'EASY':
    return {
      roundTimeMillis: 20000,
      surgePeriod: 4,
      damageMultiplier: 0.7,
    };
    case 'NORMAL':
    return {
      roundTimeMillis: 10000,
      surgePeriod: 3,
      damageMultiplier: 1.0,
    };
    case 'HARD':
    return {
      roundTimeMillis: 8000,
      surgePeriod: 3,
      damageMultiplier: 1.5,
    };
    case 'IMPOSSIBLE':
    return {
      roundTimeMillis: 6000,
      surgePeriod: 2,
      damageMultiplier: 2.0,
    };
    default:
      throw new Error('Unknown difficulty ' + difficulty);
  }
}

function getEnemies(node: ParserNode): Enemy[] {
  let enemies: Enemy[] = [];
  node.loopChildren((tag, c) => {
    if (tag !== 'e') {
      return;
    }
    let text = c.text();
    const encounter = encounters[text.toLowerCase()];

    if (!encounter) {
      // If we don't know about the enemy, just assume tier 1.
      enemies.push({name: text, tier: parseInt(c.attr('tier'), 10) || 1});
    } else {
      enemies.push({name: encounter.name, tier: encounter.tier, class: encounter.class});
    }
  });
  return enemies;
}

function generateCombatAttack(node: ParserNode, settings: SettingsType, elapsedMillis: number): CombatAttack {
  // general balance based on 4 players, scaling up / down on a curve
  // since a bit more or less damage makes a huge difference in # of rounds survivable
  const playerMultiplier = Math.sqrt(settings.numPlayers) / 2;
  const combat = node.ctx.templates.combat;

  // enemies each get to hit once - 1.5x if the party took too long
  let attackCount = combat.tier;
  if (combat.roundTimeMillis - elapsedMillis < 0) {
    attackCount = Math.round(attackCount * 1.5);
  }

  // Attack once for each tier
  let damage = 0;
  for (var i = 0; i < attackCount; i++) {
    damage += randomAttackDamage();
  }

  // Scale according to multipliers, then round to nearest whole number and cap at 10 damage/round
  damage = Math.min(10, Math.round(damage * combat.damageMultiplier * playerMultiplier));

  return {
    surge: isSurgeRound(node),
    damage,
  }
}

function generateLoot(maxTier: number): Loot[] {
  const loot: Loot[] = [
    {tier: 1, count: 0},
    {tier: 2, count: 0},
    {tier: 3, count: 0},
  ];

  // apply a slight logarithmic curve to loot rewards
  // ie tier 1 = 1, 4 = 3, 8 = 5, 12 = 6
  maxTier = Math.round(Math.log(maxTier) / Math.log(1.5));

  while (maxTier > 0) {
    const r: number = Math.random();

    if (r < 0.1 && maxTier >= 3) {
      maxTier -= 3;
      loot[2].count++;
    } else if (r < 0.4 && maxTier >= 2) {
      maxTier -= 2;
      loot[1].count++;
    } else {
      maxTier -= 1;
      loot[0].count++;
    }
  }

  for (let i = loot.length-1; i >= 0; i--) {
    if (!loot[i].count) {
      loot.splice(i, 1);
    }
  }

  return loot;
}

function generateRolls(count: number): number[] {
  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * 20) + 1);
  }
  return rolls;
}

function randomAttackDamage() {
  // D = Damage per ddt (0, 1, or 2 discrete)
  // M = miss, H = hit, C = crit, P(M) + P(H) + P(C) = 1
  // E[D] = Expected damage for a single second
  // P(C) = 1/3 * P(H)
  // P(M) = 1 - 4/3 * P(H)
  // E[D] = 0 * P(M) + 1 * P(H) + 2 * P(C) = 0.9

  const r = Math.random();
  if (r < 0.35) {
    return 0;
  } else if (r < 0.45) {
    return 2;
  } else { // r >= 0.45
    return 1;
  }
};

export function isSurgeRound(node: ParserNode): boolean {
  const rounds = node.ctx.templates.combat.roundCount;
  const surgePd = node.ctx.templates.combat.surgePeriod;
  return (surgePd - (rounds % surgePd + 1)) === 0;
}

export function handleCombatTimerStop(node: ParserNode, settings: SettingsType, elapsedMillis: number) {
  return (dispatch: Redux.Dispatch<any>): any => {
    node = node.clone();
    node.ctx.templates.combat.mostRecentAttack = generateCombatAttack(node, settings, elapsedMillis);
    node.ctx.templates.combat.mostRecentRolls = generateRolls(settings.numPlayers);
    node.ctx.templates.combat.roundCount++;

    dispatch(toCard('QUEST_CARD', (node.ctx.templates.combat.mostRecentAttack.surge) ? 'SURGE' : 'RESOLVE_ABILITIES', true));
    dispatch({type: 'QUEST_NODE', node: node} as QuestNodeAction);
  };
}

export function handleCombatEnd(node: ParserNode, settings: SettingsType, victory: boolean, maxTier: number) {
  return (dispatch: Redux.Dispatch<any>): any => {
    node = node.clone();
    node.ctx.templates.combat.levelUp = (victory) ? (settings.numPlayers <= maxTier) : false;
    node.ctx.templates.combat.loot = (victory) ? generateLoot(maxTier) : [];

    dispatch(toCard('QUEST_CARD', (victory) ? 'VICTORY' : 'DEFEAT', true));
    dispatch({type: 'QUEST_NODE', node} as QuestNodeAction);
  };
}

export function initCombat(node: ParserNode, settings: SettingsType, custom?: boolean) {
  return (dispatch: Redux.Dispatch<any>): any => {
    let tierSum: number = 0;
    let enemies: Enemy[] = [];
    if (node.elem) {
      enemies = getEnemies(node);
      for (let enemy of enemies) {
        tierSum += enemy.tier;
      }
    }
    node = node.clone();
    node.ctx.templates.combat = {
      custom: custom || false,
      enemies,
      roundCount: 0,
      numAliveAdventurers: settings.numPlayers,
      tier: tierSum,
      ...getDifficultySettings(settings.difficulty),
    };
    dispatch(toCard('QUEST_CARD', 'DRAW_ENEMIES'));
    dispatch({type: 'QUEST_NODE', node} as QuestNodeAction);
  };
}

export function initCustomCombat(settings: SettingsType) {
  return initCombat(new ParserNode(cheerio.load('<combat></combat>')('combat'), defaultQuestContext()), settings, true);
}

export function tierSumDelta(node: ParserNode, delta: number): QuestNodeAction {
  node = node.clone();
  node.ctx.templates.combat.tier = Math.max(node.ctx.templates.combat.tier + delta, 0);
  return {type: 'QUEST_NODE', node};
}

export function adventurerDelta(node: ParserNode, settings: SettingsType, delta: number): QuestNodeAction {
  const newAdventurerCount = Math.min(Math.max(0, node.ctx.templates.combat.numAliveAdventurers + delta), settings.numPlayers);
  node = node.clone();
  node.ctx.templates.combat.numAliveAdventurers = newAdventurerCount;
  return {type: 'QUEST_NODE', node};
}


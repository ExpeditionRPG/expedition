import Redux from 'redux'
import {PLAYER_DAMAGE_MULT} from '../../Constants'
import {Enemy, Loot} from '../../reducers/QuestTypes'
import {CombatDifficultySettings, CombatAttack} from './Types'
import {DifficultyType, SettingsType, AppStateWithHistory} from '../../reducers/StateTypes'
import {ParserNode, defaultContext} from '../Template'
import {toCard} from '../../actions/Card'
import {COMBAT_DIFFICULTY, PLAYER_TIME_MULT} from '../../Constants'
import {encounters} from '../../Encounters'
import {QuestNodeAction, remoteify} from '../../actions/ActionTypes'
import {loadNode} from '../../actions/Quest'

const cheerio: any = require('cheerio');

interface InitCombatArgs {
  node: ParserNode;
  settings: SettingsType;
  custom?: boolean;
}
export function initCombat(a: InitCombatArgs) {
  return (dispatch: Redux.Dispatch<any>): any => {
    let tierSum: number = 0;
    let enemies: Enemy[] = [];
    if (a.node.elem) {
      enemies = getEnemies(a.node);
      for (const enemy of enemies) {
        tierSum += enemy.tier;
      }
    }
    a.node = a.node.clone();
    a.node.ctx.templates.combat = {
      custom: a.custom || false,
      enemies,
      roundCount: 0,
      numAliveAdventurers: a.settings.numPlayers,
      tier: tierSum,
      roundTimeMillis: a.settings.timerSeconds * 1000 * (PLAYER_TIME_MULT[a.settings.numPlayers] || 1),
      ...getDifficultySettings(a.settings.difficulty),
    };
    dispatch({type: 'PUSH_HISTORY'});
    dispatch({type: 'QUEST_NODE', node: a.node} as QuestNodeAction);
    dispatch(toCard({name: 'QUEST_CARD', phase: 'DRAW_ENEMIES', noHistory: true}));
  };
}

interface InitCustomCombatArgs {
  settings?: SettingsType;
}
export const initCustomCombat = remoteify(function initCustomCombat(a: InitCustomCombatArgs, dispatch: Redux.Dispatch<any>): InitCustomCombatArgs {
  dispatch(initCombat({
    node: new ParserNode(cheerio.load('<combat></combat>')('combat'), defaultContext()),
    settings: a.settings,
    custom: true
  }));
  return {};
});

function getDifficultySettings(difficulty: DifficultyType): CombatDifficultySettings {
  const result = COMBAT_DIFFICULTY[difficulty];
  if (result === null) {
    throw new Error('Unknown difficulty ' + difficulty);
  }
  return result;
}

function getEnemies(node: ParserNode): Enemy[] {
  const enemies: Enemy[] = [];
  node.loopChildren((tag, c) => {
    if (tag !== 'e') {
      return;
    }
    const text = c.text();
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
  const playerMultiplier = PLAYER_DAMAGE_MULT[settings.numPlayers] || 1;
  const combat = node.ctx.templates.combat;

  // enemies each get to hit once - 1.5x if the party took too long
  let attackCount = combat.tier;
  if (combat.roundTimeMillis - elapsedMillis < 0) {
    attackCount = attackCount * 1.5;
  }

  // If the fight's been going on for a while and there's only a tier 1 enemy left,
  // Slowly exponentially increase damage to prevent camping / exploiting game mechanics (like combat heals)
  // Rounds after 6th round: damage multiplier:
  // 1: 1.2
  // 2: 1.4
  // 3: 1.7
  // 4: 2
  // 5: 2.5
  // 6: 3
  if (combat.tier === 1 && combat.roundCount > 6) {
    attackCount = attackCount * Math.pow(1.2, combat.roundCount - 6);
  }

  // If the fight's been going on for a while and there's only one adventurer left (but more than one player IRL),
  // Slowly exponentially increase damage to prevent other players from getting bored
  // Rounds after 6th round: damage multiplier:
  // 1: 1.2
  // 2: 1.4
  // 3: 1.7
  // 4: 2
  // 5: 2.5
  // 6: 3
  if (combat.numAliveAdventurers === 1 && settings.numPlayers > 1 && combat.roundCount > 6) {
    attackCount = attackCount * Math.pow(1.2, combat.roundCount - 6);
  }

  // Attack once for each tier
  let damage = 0;
  attackCount = Math.round(attackCount);
  for (let i = 0; i < attackCount; i++) {
    damage += randomAttackDamage();
  }

  // Scale according to multipliers, then round to nearest whole number and cap at 10 damage/round
  damage = damage * combat.damageMultiplier * playerMultiplier;
  if (damage > 1) {
    damage = Math.round(damage);
  } else { // prevent endless 0's during low-tier, <4 player encounters
    damage = Math.ceil(damage);
  }
  damage = Math.min(10, damage);

  return {
    surge: isSurgeNextRound(node),
    damage,
  }
}

function generateLoot(maxTier: number): Loot[] {
  const loot: Loot[] = [
    {tier: 1, count: 0},
    {tier: 2, count: 0},
    {tier: 3, count: 0},
  ];

  // Apply logarithmic curve to loot rewards. Outcomes (tier: loot):
  // 1: 1
  // 2: 1
  // 3: 2
  // 4: 3
  // 5: 3
  // 6: 4
  // 7: 4
  // 8+: 5
  maxTier = Math.max(1, Math.round(Math.log(maxTier - 1) / Math.log(1.5)));

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

export function isSurgeRound(rounds: number, surgePd: number): boolean {
  return (surgePd - ((rounds - 1) % surgePd + 1)) === 0;
}

export function isSurgeNextRound(node: ParserNode): boolean {
  const rounds = node.ctx.templates.combat.roundCount;
  const surgePd = node.ctx.templates.combat.surgePeriod;
  return isSurgeRound(rounds + 1, surgePd);
}

interface HandleResolvePhaseArgs {
  node?: ParserNode;
}
export const handleResolvePhase = remoteify(function handleResolvePhase(a: HandleResolvePhaseArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): HandleResolvePhaseArgs {
  if (!a.node) {
    a.node = getState().quest.node;
  }

  // Handles resolution, with a hook for if a <choice on="round"/> tag is specified.
  // Note that handling new combat nodes within a "round" handler has undefined
  // behavior and should be prevented when compiled.
  a.node = a.node.clone();
  if (a.node.getVisibleKeys().indexOf('round') !== -1) {
    a.node.ctx.templates.combat.roleplay = a.node.getNext('round');
    // Set node *before* navigation to prevent a blank first roleplay card.
    dispatch({type: 'QUEST_NODE', node: a.node} as QuestNodeAction);
    dispatch(toCard({name: 'QUEST_CARD', phase: 'ROLEPLAY', overrideDebounce: true}));
  } else {
    dispatch(toCard({name: 'QUEST_CARD', phase: 'RESOLVE_ABILITIES', overrideDebounce: true}));
    dispatch({type: 'QUEST_NODE', node: a.node} as QuestNodeAction);
  }
  return {};
});

interface MidCombatChoiceArgs {
  settings?: SettingsType;
  parent?: ParserNode;
  index: number;
}
export const midCombatChoice = remoteify(function midCombatChoice(a: MidCombatChoiceArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): MidCombatChoiceArgs {
  if (!a.parent || !a.settings) {
    a.parent = getState().quest.node;
    a.settings = getState().settings;
  }
  const remoteArgs: MidCombatChoiceArgs = {index: a.index};

  a.parent = a.parent.clone();
  const node = a.parent.ctx.templates.combat.roleplay;
  const next = node.getNext(a.index);
  const nextNode = node.handleAction(a.index);
  // Check if the next node is inside a combat node. Bad things will happen if you try to nest combat.
  let ptr = nextNode && nextNode.elem;
  while (ptr !== null && ptr.length > 0 && ptr.get(0).tagName.toLowerCase() !== 'combat') {
    ptr = ptr.parent();
  }
  const nextIsTrigger = (next && next.getTag() === 'trigger');
  const nextIsInCombat = (nextNode && ptr && ptr.length > 0);

  // Check for and resolve triggers
  if (nextIsTrigger) {
    const triggerName = next.elem.text().trim().toLowerCase();

    if (triggerName.startsWith('goto')) {
      if (!nextIsInCombat) { // Break out of combat
        dispatch(loadNode(null, nextNode));
        return remoteArgs;
      }
      // If in combat, fall through and handle like a normal combat RP node
    } else {
      if (next.isEnd()) {
        dispatch(toCard({name: 'QUEST_END'}));
        return remoteArgs;
      }

      // If the trigger exits via the win/lose handlers, break out of combat
      const parentCondition = nextNode.elem.parent().attr('on');
      if (parentCondition === 'win' || parentCondition === 'lose') {
        dispatch(loadNode(a.settings, nextNode));
        return remoteArgs;
      }
    }
  }

  if (!nextIsInCombat) {
    // Ignore this as invalid and proceed to the resolution phase
    a.parent.ctx.templates.combat.roleplay = null;
    dispatch(toCard({name: 'QUEST_CARD', phase: 'RESOLVE_ABILITIES', overrideDebounce: true}));
  } else {
    // Continue in-combat roleplay
    a.parent.ctx.templates.combat.roleplay = nextNode;
    dispatch(toCard({name: 'QUEST_CARD', phase: 'ROLEPLAY', overrideDebounce: true}));
  }
  dispatch({type: 'QUEST_NODE', node: a.parent} as QuestNodeAction);

  return remoteArgs;
});

interface HandleCombatTimerStopArgs {
  node?: ParserNode;
  settings?: SettingsType;
  elapsedMillis: number;
}
export const handleCombatTimerStop = remoteify(function handleCombatTimerStop(a: HandleCombatTimerStopArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): HandleCombatTimerStopArgs {
  if (!a.node || !a.settings) {
    a.node = getState().quest.node;
    a.settings = getState().settings;
  }

  a.node = a.node.clone();
  a.node.ctx.templates.combat.mostRecentAttack = generateCombatAttack(a.node, a.settings, a.elapsedMillis);
  a.node.ctx.templates.combat.mostRecentRolls = generateRolls(a.settings.numPlayers);
  a.node.ctx.templates.combat.roundCount++;

  if (a.node.ctx.templates.combat.mostRecentAttack.surge) {
    // Since we always skip the previous card (the timer) when going back,
    // We can preset the quest node here. This populates context in a way that
    // the latest round is considered when the "on round" branch is evaluated.
    dispatch({type: 'QUEST_NODE', node: a.node} as QuestNodeAction);
    dispatch(toCard({name: 'QUEST_CARD', phase: 'SURGE', overrideDebounce: true}));
  } else {
    dispatch(handleResolvePhase({node: a.node}));
  }

  return {elapsedMillis: a.elapsedMillis};
});

interface HandleCombatEndArgs {
  node?: ParserNode;
  settings: SettingsType;
  victory: boolean;
  maxTier: number;
}
export const handleCombatEnd = remoteify(function handleCombatEnd(a: HandleCombatEndArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory) {
  if (!a.node || !a.settings) {
    a.node = getState().quest.node;
    a.settings = getState().settings;
  }

  // Edit the final card before cloning
  if (a.victory) {
    a.node.ctx.templates.combat.tier = 0;
  } else {
    a.node.ctx.templates.combat.numAliveAdventurers = 0;
  }
  a.node = a.node.clone();
  a.node.ctx.templates.combat.levelUp = (a.victory) ? (a.settings.numPlayers <= a.maxTier) : false;
  a.node.ctx.templates.combat.loot = (a.victory) ? generateLoot(a.maxTier) : [];

  dispatch(toCard({name: 'QUEST_CARD', phase: (a.victory) ? 'VICTORY' : 'DEFEAT',  overrideDebounce: true}));
  dispatch({type: 'QUEST_NODE', node: a.node} as QuestNodeAction);

  return {victory: a.victory, maxTier: a.maxTier};
});

interface TierSumDeltaArgs {
  node?: ParserNode;
  current: number;
  delta: number;
}
export const tierSumDelta = remoteify(function tierSumDelta(a: TierSumDeltaArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): TierSumDeltaArgs {
  if (!a.node) {
    a.node = getState().quest.node;
  }

  a.node = a.node.clone();
  a.node.ctx.templates.combat.tier = Math.max(a.current + a.delta, 0);
  dispatch({type: 'QUEST_NODE', node: a.node});

  return {current: a.current, delta: a.delta};
});

interface AdventurerDeltaArgs {
  node?: ParserNode;
  settings?: SettingsType;
  current: number;
  delta: number;
}
export const adventurerDelta = remoteify(function adventurerDelta(a: AdventurerDeltaArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): AdventurerDeltaArgs {
  if (!a.node || !a.settings) {
    a.node = getState().quest.node;
    a.settings = getState().settings;
  }

  const newAdventurerCount = Math.min(Math.max(0, a.current + a.delta), a.settings.numPlayers);
  a.node = a.node.clone();
  a.node.ctx.templates.combat.numAliveAdventurers = newAdventurerCount;
  dispatch({type: 'QUEST_NODE', node: a.node});

  return {current: a.current, delta: a.delta};
});

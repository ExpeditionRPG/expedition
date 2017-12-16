import Redux from 'redux'
import {PLAYER_DAMAGE_MULT} from '../../Constants'
import {Enemy, Loot} from '../../reducers/QuestTypes'
import {CombatDifficultySettings, CombatAttack} from './Types'
import {DifficultyType, SettingsType, AppStateWithHistory, RemotePlayState} from '../../reducers/StateTypes'
import {ParserNode, defaultContext} from '../Template'
import {audioSetIntensity, audioSetPeakIntensity, audioPlaySfx} from '../../actions/Audio'
import {toCard} from '../../actions/Card'
import {COMBAT_DIFFICULTY, PLAYER_TIME_MULT, MUSIC_INTENSITY_MAX} from '../../Constants'
import {encounters} from '../../Encounters'
import {RemotePlayClientStatus, QuestNodeAction, remoteify} from '../../actions/ActionTypes'
import {loadNode} from '../../actions/Quest'
import {setRemoteStatus} from '../../actions/RemotePlay'
import * as seedrandom from 'seedrandom'
import {StatusEvent} from 'expedition-qdl/lib/remote/Events'
import {getRemotePlayClient} from '../../RemotePlay'

const cheerio: any = require('cheerio');

function numLocalAndRemotePlayers(settings: SettingsType, rp: RemotePlayState): number {
  if (!rp) {
    return settings.numPlayers;
  }

  let count = 0;
  for (const c of Object.keys(rp.clientStatus)) {
    const status = rp.clientStatus[c];
    if (!status.connected) {
      continue;
    }
    count += (status.numPlayers || 1);
  }
  return count;
}

interface InitCombatArgs {
  node: ParserNode;
  settings: SettingsType;
  custom?: boolean;
}
export const initCombat = remoteify(function initCombat(a: InitCombatArgs, dispatch: Redux.Dispatch<any>,  getState: () => AppStateWithHistory) {
  let tierSum: number = 0;
  let enemies: Enemy[] = [];
  if (a.node.elem) {
    enemies = getEnemies(a.node);
    for (const enemy of enemies) {
      tierSum += enemy.tier;
    }
  }
  a.node = a.node.clone();
  const totalPlayerCount = numLocalAndRemotePlayers(a.settings, getState().remotePlay);
  a.node.ctx.templates.combat = {
    custom: a.custom || false,
    enemies,
    roundCount: 0,
    numAliveAdventurers: totalPlayerCount,
    tier: tierSum,
    roundTimeMillis: a.settings.timerSeconds * 1000 * (PLAYER_TIME_MULT[totalPlayerCount] || 1),
    ...getDifficultySettings(a.settings.difficulty),
  };
  dispatch({type: 'PUSH_HISTORY'});
  dispatch({type: 'QUEST_NODE', node: a.node} as QuestNodeAction);
  dispatch(toCard({name: 'QUEST_CARD', phase: 'DRAW_ENEMIES', noHistory: true}));
  dispatch(audioSetIntensity(calculateAudioIntensity(tierSum, tierSum, 0, 0)));
  return null;
});

interface InitCustomCombatArgs {
  settings?: SettingsType;
  rp?: RemotePlayState;
}
export const initCustomCombat = remoteify(function initCustomCombat(a: InitCustomCombatArgs, dispatch: Redux.Dispatch<any>,  getState: () => AppStateWithHistory): InitCustomCombatArgs {
  if (!a.settings) {
    a.settings = getState().settings;
  }
  if (!a.rp) {
    a.rp = getState().remotePlay;
  }
  dispatch(initCombat({
    node: new ParserNode(cheerio.load('<combat></combat>')('combat'), defaultContext()),
    settings: a.settings,
    custom: true
  }));
  return {};
});

function calculateAudioIntensity(currentTier: number, maxTier: number, deadAdventurers: number, roundCount: number): number {
  // Some pretty arbitrary weights on different combat factors and how they affect music intensity
  // Optimized for a tier 3 fight being 12, tier 8 (max relevant tier) being 32
  // With intensity increasing generally over time, but fading off quickly as you defeat enemies
  return Math.round(Math.min(MUSIC_INTENSITY_MAX, 2 * currentTier + 2 * maxTier + 4 * deadAdventurers + 0.5 * roundCount));
}

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

function generateCombatAttack(node: ParserNode, settings: SettingsType, rp: RemotePlayState, elapsedMillis: number, rng: () => number): CombatAttack {
  const totalPlayerCount = numLocalAndRemotePlayers(settings, rp);
  const playerMultiplier = PLAYER_DAMAGE_MULT[totalPlayerCount] || 1;
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
  if (combat.numAliveAdventurers === 1 && totalPlayerCount > 1 && combat.roundCount > 6) {
    attackCount = attackCount * Math.pow(1.2, combat.roundCount - 6);
  }

  // Attack once for each tier
  let damage = 0;
  attackCount = Math.round(attackCount);
  for (let i = 0; i < attackCount; i++) {
    damage += randomAttackDamage(rng);
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

function generateLoot(maxTier: number, rng: () => number): Loot[] {
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
    const r: number = rng();

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

function generateRolls(count: number, rng: ()=>number): number[] {
  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(rng() * 20) + 1);
  }
  return rolls;
}

function randomAttackDamage(rng: () => number) {
  // D = Damage per ddt (0, 1, or 2 discrete)
  // M = miss, H = hit, C = crit, P(M) + P(H) + P(C) = 1
  // E[D] = Expected damage for a single second
  // P(C) = 1/3 * P(H)
  // P(M) = 1 - 4/3 * P(H)
  // E[D] = 0 * P(M) + 1 * P(H) + 2 * P(C) = 0.9

  const r = rng();
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
    // Set node *before* navigation to prevent a blank first roleplay card.
    dispatch({type: 'QUEST_NODE', node: a.node.getNext('round')} as QuestNodeAction);
    dispatch(toCard({name: 'QUEST_CARD', phase: 'MID_COMBAT_ROLEPLAY', overrideDebounce: true}));
  } else {
    dispatch(toCard({name: 'QUEST_CARD', phase: 'RESOLVE_ABILITIES', overrideDebounce: true}));
    dispatch({type: 'QUEST_NODE', node: a.node} as QuestNodeAction);
  }
  return {};
});

interface HandleCombatTimerStartArgs {
  settings?: SettingsType;
}
export const handleCombatTimerStart = remoteify(function handleCombatTimerStart(a: HandleCombatTimerStartArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory) {
  console.log('handling combat timer start');
  if (!a.settings) {
    a.settings = getState().settings;
  }
  dispatch(toCard({name: 'QUEST_CARD', phase: 'TIMER'}));
  dispatch(audioSetPeakIntensity(1));
  return {};
});

// NOTE: Instead of an ACTION event, this sends a STATUS
// which is non-transactional and unlikely to conflict
// when all users are trying to stop the timer.
interface HandleCombatTimerHoldArgs {
  elapsedMillis: number;
}
export const handleCombatTimerHold = remoteify(function handleCombatTimerHold(a: HandleCombatTimerHoldArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory) {
  dispatch(setRemoteStatus({
    type: 'STATUS',
    waitingOn: {
      type: 'TIMER',
      elapsedMillis: a.elapsedMillis,
    },
  }));
  return null;
});

interface HandleCombatTimerStopArgs {
  node?: ParserNode;
  settings?: SettingsType;
  rp?: RemotePlayState;
  elapsedMillis: number;
  seed: string;
}
export const handleCombatTimerStop = remoteify(function handleCombatTimerStop(a: HandleCombatTimerStopArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): HandleCombatTimerStopArgs {
  if (!a.node || !a.settings) {
    a.node = getState().quest.node;
    a.settings = getState().settings;
  }
  if (!a.rp) {
    a.rp = getState().remotePlay;
  }

  dispatch(audioSetPeakIntensity(0));

  a.node = a.node.clone();
  const arng = seedrandom.alea(a.seed);
  a.node.ctx.templates.combat.mostRecentAttack = generateCombatAttack(a.node, a.settings, a.rp, a.elapsedMillis, arng);
  a.node.ctx.templates.combat.mostRecentRolls = generateRolls(a.settings.numPlayers, arng);
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

  // Tell everyone we're no longer waiting on anything
  dispatch(setRemoteStatus({
    type: 'STATUS',
    waitingOn: null,
  }));

  return {elapsedMillis: a.elapsedMillis, seed: a.seed};
});

interface HandleCombatEndArgs {
  node?: ParserNode;
  settings: SettingsType;
  rp?: RemotePlayState;
  victory: boolean;
  maxTier: number;
  seed: string;
}
export const handleCombatEnd = remoteify(function handleCombatEnd(a: HandleCombatEndArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory) {
  if (!a.node || !a.settings) {
    a.node = getState().quest.node;
    a.settings = getState().settings;
  }
  if (!a.rp) {
    a.rp = getState().remotePlay;
  }

  // Edit the final card before cloning
  if (a.victory) {
    a.node.ctx.templates.combat.tier = 0;
  } else {
    a.node.ctx.templates.combat.numAliveAdventurers = 0;
  }
  a.node = a.node.clone();
  a.node.ctx.templates.combat.levelUp = (a.victory) ? (numLocalAndRemotePlayers(a.settings, a.rp) <= a.maxTier) : false;

  const arng = seedrandom.alea(a.seed);
  a.node.ctx.templates.combat.loot = (a.victory) ? generateLoot(a.maxTier, arng) : [];

  dispatch({type: 'PUSH_HISTORY'});
  dispatch({type: 'QUEST_NODE', node: a.node} as QuestNodeAction);
  dispatch(toCard({name: 'QUEST_CARD', phase: (a.victory) ? 'VICTORY' : 'DEFEAT',  overrideDebounce: true, noHistory: true}));
  dispatch(audioSetIntensity(0));
  return {victory: a.victory, maxTier: a.maxTier, seed: a.seed};
});

function findCombatParent(node: ParserNode) {
  let elem = node && node.elem;
  while (elem !== null && elem.length > 0 && elem.get(0).tagName.toLowerCase() !== 'combat') {
    elem = elem.parent();
  }
  return elem;
}

interface MidCombatChoiceArgs {
  settings?: SettingsType;
  node?: ParserNode;
  maxTier: number;
  index: number;
  seed: string;
}
export const midCombatChoice = remoteify(function midCombatChoice(a: MidCombatChoiceArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): MidCombatChoiceArgs {
  if (!a.node || !a.settings) {
    a.node = getState().quest.node;
    a.settings = getState().settings;
  }
  const remoteArgs: MidCombatChoiceArgs = {index: a.index, seed: a.seed, maxTier: a.maxTier};
  const parentCombatElem = findCombatParent(a.node);
  const nextNode = a.node.handleAction(a.index);
  const nextParentCombatElem = findCombatParent(nextNode);
  const nextIsInSameCombat = (nextParentCombatElem && nextParentCombatElem.length > 0) && parentCombatElem.attr('data-line') === nextParentCombatElem.attr('data-line');

  // Check for and resolve triggers
  const next = a.node.getNext(a.index);
  const nextIsTrigger = (next && next.getTag() === 'trigger');
  if (nextIsTrigger) {
    const triggerName = next.elem.text().trim().toLowerCase();
    if (triggerName.startsWith('goto') && nextIsInSameCombat) {
      // If we jump to somewhere in the same combat,
      // it's handled like a normal combat RP choice change (below).
    } else if (next.isEnd()) {
      // Treat quest end as normal
      dispatch(toCard({name: 'QUEST_END'}));
      return remoteArgs;
    } else {
      // If the trigger exits via the win/lose handlers, go to the appropriate
      // combat end card
      const parentCondition = nextNode.elem.parent().attr('on');
      if (parentCondition === 'win' || parentCondition === 'lose') {
        dispatch(handleCombatEnd({
          node: new ParserNode(parentCombatElem, a.node.ctx),
          settings: a.settings,
          victory: (parentCondition === 'win'),
          maxTier: a.maxTier,
          seed: a.seed,
        }));
        return remoteArgs;
      } else {
        // Otherwise, treat like a typical event trigger
        dispatch(loadNode(a.settings, nextNode));
        return remoteArgs;
      }
    }
  }

  if (nextIsInSameCombat) {
    // Continue in-combat roleplay with the next node.
    dispatch(toCard({name: 'QUEST_CARD', phase: 'MID_COMBAT_ROLEPLAY', overrideDebounce: true}));
    dispatch({type: 'QUEST_NODE', node: nextNode} as QuestNodeAction);
  } else {
    // If the next node is out of this combat, that means we've dropped off the end of the
    // interestitial roleplay. Go back to combat resolution phase.
    dispatch(toCard({name: 'QUEST_CARD', phase: 'RESOLVE_ABILITIES', overrideDebounce: true}));
    dispatch({type: 'QUEST_NODE', node: new ParserNode(parentCombatElem, a.node.ctx)} as QuestNodeAction);
  }
  return remoteArgs;
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
  dispatch(audioSetIntensity(calculateAudioIntensity(a.node.ctx.scope._.currentCombatTier(),
    a.node.ctx.scope._.currentCombatTier(),
    a.node.ctx.scope._.numAdventurers() - a.node.ctx.scope._.aliveAdventurers(),
    a.node.ctx.scope._.currentCombatRound()
  )));
  return {current: a.current, delta: a.delta};
});

interface AdventurerDeltaArgs {
  node?: ParserNode;
  settings?: SettingsType;
  current: number;
  delta: number;
  rp?: RemotePlayState;
}
export const adventurerDelta = remoteify(function adventurerDelta(a: AdventurerDeltaArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): AdventurerDeltaArgs {
  if (!a.node || !a.settings) {
    a.node = getState().quest.node;
    a.settings = getState().settings;
  }
  if (!a.rp) {
    a.rp = getState().remotePlay;
  }

  const newAdventurerCount = Math.min(Math.max(0, a.current + a.delta), numLocalAndRemotePlayers(a.settings, a.rp));
  a.node = a.node.clone();
  a.node.ctx.templates.combat.numAliveAdventurers = newAdventurerCount;
  dispatch({type: 'QUEST_NODE', node: a.node});
  dispatch(audioSetIntensity(calculateAudioIntensity(a.node.ctx.scope._.currentCombatTier(),
    a.node.ctx.scope._.currentCombatTier(),
    a.node.ctx.scope._.numAdventurers() - a.node.ctx.scope._.aliveAdventurers(),
    a.node.ctx.scope._.currentCombatRound()
  )));
  return {current: a.current, delta: a.delta};
});

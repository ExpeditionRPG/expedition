import {audioSet} from 'app/actions/Audio';
import {setMultiplayerStatus} from 'app/actions/Multiplayer';
import {numAdventurers, numAliveAdventurers, numLocalAdventurers, numPlayers} from 'app/actions/Settings';
import {COMBAT_DIFFICULTY, PLAYER_DAMAGE_MULT, PLAYER_TIME_MULT} from 'app/Constants';
import {ENCOUNTERS} from 'app/Encounters';
import {Enemy, Loot} from 'app/reducers/QuestTypes';
import {AppStateWithHistory, DifficultyType, MultiplayerState, SettingsType} from 'app/reducers/StateTypes';
import Redux from 'redux';
const seedrandom = require('seedrandom');
import {sendStatus} from 'app/actions/Multiplayer';
import {remoteify} from 'app/multiplayer/Remoteify';
import {generateSeed} from 'shared/parse/Context';
import {generateLeveledChecks} from '../decision/Actions';
import {DecisionPhase} from '../decision/Types';
import {calculateAudioIntensity, findCombatParent, setAndRenderNode} from '../Render';
import {ParserNode} from '../TemplateTypes';
import {CombatAttack, CombatDifficultySettings, CombatPhase, CombatState} from './Types';

export function roundTimeMillis(settings: SettingsType, mp?: MultiplayerState) {
  const totalPlayerCount = numPlayers(settings, mp);
  return settings.timerSeconds * 1000 * PLAYER_TIME_MULT[totalPlayerCount];
}

export function getEnemiesAndTier(node?: ParserNode): {enemies: Enemy[], tier: number} {
  let tier: number = 0;
  let enemies: Enemy[] = [];
  if (node && node.elem) {
    enemies = getEnemies(node);
    for (const enemy of enemies) {
      tier += enemy.tier;
    }
  }
  return {enemies, tier};
}

export function generateCombatTemplate(settings: SettingsType, node?: ParserNode, mp?: MultiplayerState): CombatState {
  const {enemies, tier} = getEnemiesAndTier(node);

  return {
    phase: CombatPhase.drawEnemies,
    decisionPhase: DecisionPhase.prepare,
    enemies,
    numAliveAdventurers: numLocalAdventurers(settings, mp),
    roundCount: 0,
    tier,
    seed: (node && node.ctx && node.ctx.seed) || '',
    ...getDifficultySettings(settings.difficulty),
  };
}

interface InitCombatArgs {
  node: ParserNode;
}
export const initCombat = remoteify(function initCombat(a: InitCombatArgs, dispatch: Redux.Dispatch<any>,  getState: () => AppStateWithHistory) {
  const mp = getState().multiplayer;
  a.node = a.node.clone();
  const settings = getState().settings;
  const combat = generateCombatTemplate(settings, a.node, mp);
  a.node.ctx.templates.combat = combat;
  dispatch(setAndRenderNode(a.node));
  return null;
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
    const encounter = ENCOUNTERS[text.toLowerCase()];

    if (!encounter) {
      // If we don't know about the enemy, just assume tier 1.
      enemies.push({name: text, tier: parseInt(c.attr('tier'), 10) || 1});
    } else {
      enemies.push({name: encounter.name, tier: encounter.tier, class: encounter.class});
    }
  });
  return enemies;
}

function generateCombatAttack(node: ParserNode, settings: SettingsType, mp: MultiplayerState, elapsedMillis: number, rng: () => number): CombatAttack {
  const totalPlayerCount = numPlayers(settings, mp);
  const playerMultiplier = PLAYER_DAMAGE_MULT[totalPlayerCount] || 1;
  const combat = node.ctx.templates.combat;
  if (!combat) {
    console.error('Undefined combat for node');
    return {surge: false, damage: 0};
  }

  // enemies each get to hit once - 1.5x if the party took too long
  let attackCount = combat.tier;
  const roundTime = roundTimeMillis(settings, mp);
  if (roundTime - elapsedMillis < 0) {
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
  const aliveAdventurers = numAliveAdventurers(settings, node, mp);
  if (aliveAdventurers === 1 && totalPlayerCount > 1 && combat.roundCount > 6) {
    attackCount = attackCount * Math.pow(1.2, combat.roundCount - 6);
  }

  // Attack once for each tier
  let damage = 0;
  attackCount = Math.round(attackCount);
  for (let i = 0; i < attackCount; i++) {
    damage += randomAttackDamage(rng);
  }

  // Scale according to multipliers, then round to nearest whole number and cap at maxRoundDamage constant
  damage = damage * combat.damageMultiplier * playerMultiplier;
  if (damage > 1) {
    damage = Math.round(damage);
  } else { // prevent endless 0's during low-tier, <4 player encounters
    damage = Math.ceil(damage);
  }
  damage = Math.min(combat.maxRoundDamage, damage);

  return {
    damage,
    surge: isSurgeNextRound(combat),
  };
}

function generateLoot(maxTier: number, adventurers: number, rng: () => number): Loot[] {
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
  let lootTier = Math.max(1, Math.round(Math.log(maxTier - 1) / Math.log(1.5)));

  // Give a small boost to small parties
  if (adventurers <= 3) {
    lootTier++;
  }

  while (lootTier > 0) {
    const r: number = rng();
    if (r < 0.1 && lootTier >= 3) {
      lootTier -= 3;
      loot[2].count++;
    } else if (r < 0.4 && lootTier >= 2) {
      lootTier -= 2;
      loot[1].count++;
    } else {
      lootTier -= 1;
      loot[0].count++;
    }
  }

  for (let i = loot.length - 1; i >= 0; i--) {
    if (!loot[i].count) {
      loot.splice(i, 1);
    }
  }

  return loot;
}

function generateRolls(count: number, rng: () => number): number[] {
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
}

export function isSurgeRound(rounds: number, surgePd: number): boolean {
  return (surgePd - ((rounds - 1) % surgePd + 1)) === 0;
}

export function isSurgeNextRound(combatState?: CombatState): boolean {
  if (!combatState) {
    return false;
  }
  return isSurgeRound(combatState.roundCount + 1, combatState.surgePeriod);
}

interface HandleResolvePhaseArgs {
  node?: ParserNode;
}
export const handleResolvePhase = remoteify(function handleResolvePhase(a: HandleResolvePhaseArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): HandleResolvePhaseArgs {
  if (!a.node) {
    a.node = getState().quest.node;
  }

  const node = a.node.clone();

  // Handles resolution, with a hook for if a <choice on="round"/> tag is specified.
  // Note that handling new combat nodes within a "round" handler has undefined
  // behavior and should be prevented when compiled.
  const result = node.getNext('round');
  if (result !== null) {
    node.ctx.templates.combat.phase = CombatPhase.midCombatRoleplay;
    dispatch(setAndRenderNode(result));
  } else {
    node.ctx.templates.combat.phase = CombatPhase.resolveAbilities;
    dispatch(setAndRenderNode(node));
  }
  return {};
});

interface HandleCombatTimerStartArgs {
  settings?: SettingsType;
  node?: ParserNode;
}
export const handleCombatTimerStart = remoteify(function handleCombatTimerStart(a: HandleCombatTimerStartArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory) {
  if (!a.settings) {
    a.settings = getState().settings;
  }
  if (!a.node) {
    a.node = getState().quest.node;
  }

  const node = a.node.clone();
  node.ctx.templates.combat.phase = CombatPhase.timer;
  dispatch(setAndRenderNode(node));

  // If we have no local alive adventurers but we're playing multiplayer, automatically put the timer in hold state.
  // Note that we don't have to check for multiplayer here, as starting the timer with 0 total alive adventurers
  // is not allowed by UI.
  if (node.ctx.templates.combat.numAliveAdventurers === 0) {
    dispatch(handleCombatTimerHold({elapsedMillis: 0}));
  }
  return {};
});

// NOTE: Instead of an ACTION event, this sends a STATUS
// which is non-transactional and unlikely to conflict
// when all users are trying to stop the timer.
interface HandleCombatTimerHoldArgs {
  elapsedMillis: number;
}
export const handleCombatTimerHold = remoteify(function handleCombatTimerHold(a: HandleCombatTimerHoldArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory) {
  dispatch(setMultiplayerStatus({
    type: 'STATUS',
    waitingOn: {
      elapsedMillis: a.elapsedMillis,
      type: 'TIMER',
    },
  }));
  return null;
});

interface HandleCombatTimerStopArgs {
  elapsedMillis: number;
  node?: ParserNode;
  seed: string;
  settings?: SettingsType;
}
export const handleCombatTimerStop = remoteify(function handleCombatTimerStop(a: HandleCombatTimerStopArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): HandleCombatTimerStopArgs {
  if (!a.node || !a.settings) {
    a.node = getState().quest.node;
    a.settings = getState().settings;
  }
  const mp = getState().multiplayer;

  dispatch(audioSet({peakIntensity: 0}));

  const node = a.node.clone();
  node.ctx.templates.combat.seed = generateSeed(node.ctx.templates.combat.seed);
  const arng = seedrandom.alea(node.ctx.templates.combat.seed);
  node.ctx.templates.combat.mostRecentAttack = generateCombatAttack(a.node, a.settings, mp, a.elapsedMillis, arng);
  node.ctx.templates.combat.mostRecentRolls = generateRolls(numLocalAdventurers(a.settings), arng);
  node.ctx.templates.combat.roundCount++;

  // This is parsed when loading a saved quest, so that "on round" nodes
  // can be appropriately evaluated.
  node.addToPath('|' + node.ctx.templates.combat.roundCount);

  if (node.ctx.templates.combat.mostRecentAttack.surge) {
    // Since we always skip the previous card (the timer) when going back,
    // We can preset the quest node here. This populates context in a way that
    // the latest round is considered when the "on round" branch is evaluated.
    node.ctx.templates.combat.phase = CombatPhase.surge;
    dispatch(setAndRenderNode(node));
  } else {
    dispatch(handleResolvePhase({node}));
  }

  // Tell everyone we're no longer waiting on anything
  dispatch(setMultiplayerStatus({
    type: 'STATUS',
    waitingOn: undefined,
  }));

  return {elapsedMillis: a.elapsedMillis, seed: a.seed};
});

interface HandleCombatEndArgs {
  maxTier: number;
  node?: ParserNode;
  seed: string;
  settings: SettingsType;
  victory: boolean;
}
export const handleCombatEnd = remoteify(function handleCombatEnd(a: HandleCombatEndArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory) {
  if (!a.node || !a.settings) {
    a.node = getState().quest.node;
    a.settings = getState().settings;
  }
  const mp = getState().multiplayer;

  // If we were given a non-combat node due to some bug in previous code,
  // find its parent combat container and use it.
  if (a.node.getTag() !== 'combat') {
    const parent = findCombatParent(a.node);
    if (parent === null) {
      throw new Error('Non-combat node given for handleCombatEnd, soft fix failed.');
    }
    a.node = new ParserNode(parent, a.node.ctx);
  }

  const node = a.node.clone();
  node.ctx.templates.combat.tier = 0;
  node.ctx.templates.combat.numAliveAdventurers = 0;
  const arng = seedrandom.alea(node.ctx.templates.combat.seed);
  const adventurers = numAdventurers(a.settings, mp);

  node.ctx.templates.combat.levelUp = (a.victory) ? (adventurers <= a.maxTier) : false;
  node.ctx.templates.combat.loot = (a.victory) ? generateLoot(a.maxTier, adventurers, arng) : [];
  node.ctx.templates.combat.phase = (a.victory) ? CombatPhase.victory : CombatPhase.defeat;

  dispatch(setAndRenderNode(node));
  return {victory: a.victory, maxTier: a.maxTier, seed: a.seed};
});

interface TierSumDeltaArgs {
  current: number;
  delta: number;
  node?: ParserNode;
}
export const tierSumDelta = remoteify(function tierSumDelta(a: TierSumDeltaArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): TierSumDeltaArgs {
  if (!a.node) {
    a.node = getState().quest.node;
  }
  const node = a.node.clone();

  node.ctx.templates.combat.tier = Math.max(a.current + a.delta, 0);
  dispatch({type: 'QUEST_NODE', node});
  dispatch(audioSet({intensity: calculateAudioIntensity(node, node.ctx.scope._.numAdventurers())}));
  return {current: a.current, delta: a.delta};
});

interface AdventurerDeltaArgs {
  current: number;
  delta: number;
  node: ParserNode;
  settings: SettingsType;
}
export const adventurerDelta = remoteify(function adventurerDelta(a: AdventurerDeltaArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory) {
  const mp = getState().multiplayer;
  const newAdventurerCount = Math.min(Math.max(0, a.current + a.delta), numLocalAdventurers(a.settings, mp));

  const node = a.node.clone();

  node.ctx.templates.combat.numAliveAdventurers = newAdventurerCount;
  dispatch({type: 'QUEST_NODE', node});
  dispatch(audioSet({intensity: calculateAudioIntensity(node, node.ctx.scope._.numAdventurers())}));
  // Send status to update player count remotely.
  dispatch(sendStatus());
  return null;
});

interface SetupCombatDecisionArgs {
  node?: ParserNode;
  seed: string;
}
export const setupCombatDecision = remoteify(function setupCombatDecision(a: SetupCombatDecisionArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): SetupCombatDecisionArgs {
  if (!a.node) {
    a.node = getState().quest.node;
  }
  const node = a.node.clone();
  const settings = getState().settings;
  const mp = getState().multiplayer;
  node.ctx.templates.combat.phase = CombatPhase.midCombatDecision;
  node.ctx.templates.combat.decisionPhase = DecisionPhase.prepare;
  const arng = seedrandom.alea(a.seed);
  node.ctx.templates.decision = {
    leveledChecks: generateLeveledChecks(numAliveAdventurers(settings, node, mp), arng),
    selected: null,
    rolls: [],
    phase: node.ctx.templates.combat.decisionPhase,
  };
  dispatch(setAndRenderNode(node));
  return {seed: a.seed};
});

interface GotoPhaseArgs {
  node?: ParserNode;
  phase: CombatPhase;
}
export const gotoPhase = remoteify(function gotoPhase(a: GotoPhaseArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): GotoPhaseArgs {
  if (!a.node) {
    a.node = getState().quest.node;
  }
  const node = a.node.clone();
  node.ctx.templates.combat.phase = a.phase;
  dispatch(setAndRenderNode(node));
  return {phase: a.phase};
});

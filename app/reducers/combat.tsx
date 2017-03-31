import Redux from 'redux'
import {DifficultyType, CombatDifficultySettings, CombatAttack, MidCombatPhase, EndCombatPhase, Enemy, Loot, CombatState, isCombatPhase} from './QuestTypes'
import {AppState} from './StateTypes'
import {InitCombatAction, CombatTimerStopAction, TierSumDeltaAction, AdventurerDeltaAction, NavigateAction, CombatVictoryAction} from '../actions/ActionTypes'
import {loadCombatNode} from '../QuestParser'
import {SettingsType} from '../reducers/StateTypes'

function getDifficultySettings(difficulty: DifficultyType): CombatDifficultySettings {
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

export function isSurgeRound(combat: CombatState): boolean {
  let rounds = combat.roundCount;
  let surgePd = combat.surgePeriod;
  return (surgePd - (rounds % surgePd + 1)) === 0;
}

export function generateCombatAttack(combat: CombatState, elapsedMillis: number, settings: SettingsType): CombatAttack {
  // general balance based on 4 players, scaling up / down on a curve
  // since a bit more or less damage makes a huge difference in # of rounds survivable
  let playerMultiplier = Math.sqrt(settings.numPlayers) / 2;

  // enemies each get to hit once - 1.5x if the party took too long
  let attackCount = combat.tier;
  if (combat.roundTimeMillis - elapsedMillis < 0) {
    attackCount = Math.round(attackCount * 1.5);
  }

  // Attack once for each tier
  let damage = 0;
  for (var i = 0; i < attackCount; i++) {
    damage += _randomAttackDamage();
  }

  // Scale according to multipliers, then round to nearest whole number and cap at 10 damage/round
  damage = Math.min(10, Math.round(damage * combat.damageMultiplier * playerMultiplier));

  return {
    surge: isSurgeRound(combat),
    damage,
  }
}

export function generateLoot(maxTier: number): Loot[] {
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

function _randomAttackDamage() {
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

export function combat(state: CombatState, action: Redux.Action): CombatState {
  var newState: CombatState;
  // TODO: Difficulty settings should change with settings change.
  switch(action.type) {
    case 'INIT_COMBAT':
      let tierSum: number = 0;
      let combatAction = action as InitCombatAction;
      let enemies: Enemy[] =  (combatAction.node) ? loadCombatNode(combatAction.node, combatAction.result.ctx).enemies : [];
      for (let enemy of enemies) {
        tierSum += enemy.tier;
      }
      return {
        ...getDifficultySettings(combatAction.difficulty),
        enemies: enemies,
        roundCount: 0,
        numAliveAdventurers: combatAction.numPlayers,
        tier: tierSum,
      };
    case 'COMBAT_TIMER_STOP':
      let elapsedMillis: number = (action as CombatTimerStopAction).elapsedMillis;
      let settings: SettingsType = (action as CombatTimerStopAction).settings;
      return {...state,
        mostRecentAttack: generateCombatAttack(state, elapsedMillis, settings),
        mostRecentRolls: generateRolls(settings.numPlayers),
        roundCount: state.roundCount + 1,
      };
    case 'COMBAT_DEFEAT':
      return {...state,
        levelUp: false,
        loot: [],
      };
    case 'COMBAT_VICTORY':
      let victoryAction = action as CombatVictoryAction;
      return {...state,
        levelUp: (victoryAction.numPlayers <= victoryAction.maxTier),
        loot: generateLoot(victoryAction.maxTier),
      };
    case 'TIER_SUM_DELTA':
      let newTierCount = state.tier + (action as TierSumDeltaAction).delta;
      return {...state, tier: Math.max(newTierCount, 0)};
    case 'ADVENTURER_DELTA':
      let newAdventurerCount = state.numAliveAdventurers + (action as AdventurerDeltaAction).delta;
      if (newAdventurerCount > (action as AdventurerDeltaAction).numPlayers || newAdventurerCount < 0) {
        return state;
      }
      return {...state, numAliveAdventurers: newAdventurerCount};
    default:
      return state;
  }
}

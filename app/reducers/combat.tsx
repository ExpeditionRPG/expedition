import {CombatDifficultyType, CombatDifficultySettings, CombatAttack, MidCombatPhase, EndCombatPhase, Enemy, Loot, CombatDetails} from './QuestTypes'
import {InitCombatAction, CombatTimerStopAction} from '../actions/ActionTypes'
import {handleChoice, loadCombatNode} from '../scripts/QuestParser'

function getDifficultySettings(difficulty: CombatDifficultyType): CombatDifficultySettings {
  switch(difficulty) {
    case 'EASY':
    return {
      roundTimeMillis: 15000,
      surgePeriod: 4,
      damageMultiplier: 0.75,
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
      throw new Error("Unknown difficulty " + difficulty);
  }
}

export function generateCombatAttack(details: CombatDetails, elapsedMillis: number): CombatAttack {
  let phase = details.phase as MidCombatPhase;

  // enemies each get to hit once - twice if the party took too long
  let damage = 0;
  let attackCount = phase.tier;
  if (details.settings.roundTimeMillis - elapsedMillis < 0) {
    attackCount *= 2;
  }

  // Attack once for each tier
  for (var i = 0; i < attackCount; i++) {
    damage += _randomAttackDamage();
  }

  // Scale according to multiplier, then round to whole number.
  damage = Math.round(damage * details.settings.damageMultiplier);

  return {
    surge: (details.settings.surgePeriod - ((phase.roundCount % details.settings.surgePeriod) + 1)) === 0,
    damage,
  }
}

function _generateLoot(maxTier: number): Loot[] {
  var loot: Loot[] = [
    {tier: 1, count: 0},
    {tier: 2, count: 0},
    {tier: 3, count: 0},
  ];

  while (maxTier > 0) {
    var r: number = Math.random();

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

  for (var i = loot.length-1; i >= 0; i--) {
    if (!loot[i].count) {
      loot.splice(i, 1);
    }
  }

  return loot;
};

function _randomAttackDamage() {
  // D = Damage per ddt (0, 1, or 2 discrete)
  // M = miss, H = hit, C = crit, P(M) + P(H) + P(C) = 1
  // E[D] = Expected damage for a single second
  // P(C) = 1/3 * P(H)
  // P(M) = 1 - 4/3 * P(H)
  // E[D] = 0 * P(M) + 1 * P(H) + 2 * P(C) = 0.9

  var r = Math.random();
  if (r < 0.4) {
    return 0;
  } else if (r < 0.5) {
    return 2;
  } else { // r >= 0.5
    return 1;
  }
};

export function initCombat(enemies: Enemy[], numPlayers: number, difficulty: CombatDifficultyType): CombatDetails {
  let tierSum: number = 0;
  for (let enemy of enemies) {
    tierSum += enemy.tier;
  }

  return {
    phase: {
      enemies,
      roundCount: 0,
      numAliveAdventurers: numPlayers,
      tier: tierSum,
    },
    settings: getDifficultySettings(difficulty)
  };
}
import {Enemy, Loot} from '../../reducers/QuestTypes'

export interface CombatAttack {
  surge: boolean;
  damage: number;
}

export interface MidCombatPhase {
  enemies: Enemy[];
  mostRecentAttack?: CombatAttack;
  mostRecentRolls?: number[];
  numAliveAdventurers: number;
  roundCount: number;
  tier: number;
}
export interface EndCombatPhase {
  levelUp?: boolean;
  loot?: Loot[];
}

export interface CombatDifficultySettings {
  roundTimeMillis: number,
  surgePeriod: number,
  damageMultiplier: number,
}

export interface CombatState extends CombatDifficultySettings, MidCombatPhase, EndCombatPhase {
  custom: boolean;
}

export type CombatPhase = 'DRAW_ENEMIES' | 'PREPARE' | 'TIMER' | 'SURGE' | 'RESOLVE_ABILITIES' | 'ENEMY_TIER' | 'PLAYER_TIER' | 'VICTORY' | 'DEFEAT';

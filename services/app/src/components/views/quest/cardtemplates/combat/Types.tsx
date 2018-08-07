import {Enemy, Loot} from 'app/reducers/QuestTypes';
import {DecisionPhase} from '../decision/Types';

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
  decisionPhase: DecisionPhase;
}

export interface EndCombatPhase {
  levelUp?: boolean;
  loot?: Loot[];
}

export interface CombatDifficultySettings {
  surgePeriod: number;
  decisionPeriod: number;
  damageMultiplier: number;
  maxRoundDamage: number;
}

export interface CombatState extends CombatDifficultySettings, MidCombatPhase, EndCombatPhase {
  custom: boolean;
}

export type CombatPhase = 'DRAW_ENEMIES'
  | 'PREPARE'
  | 'TIMER'
  | 'SURGE'
  | 'RESOLVE_ABILITIES'
  | 'RESOLVE_DAMAGE'
  | 'VICTORY'
  | 'DEFEAT'
  | 'NO_TIMER'
  | 'MID_COMBAT_ROLEPLAY'
  | 'MID_COMBAT_DECISION';

import {ParserNode} from '../TemplateTypes'
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
  roundTimeMillis: number;
  roundCount: number;
  tier: number;
  roleplay?: ParserNode;
}

export interface EndCombatPhase {
  levelUp?: boolean;
  loot?: Loot[];
}

export interface CombatDifficultySettings {
  surgePeriod: number,
  damageMultiplier: number,
  maxRoundDamage: number,
}

export interface CombatState extends CombatDifficultySettings, MidCombatPhase, EndCombatPhase {
  custom: boolean;
  roundTimeMillis: number;
}

export type CombatPhase = 'DRAW_ENEMIES' | 'PREPARE' | 'TIMER' | 'SURGE' | 'RESOLVE_ABILITIES' | 'RESOLVE_DAMAGE' | 'VICTORY' | 'DEFEAT' | 'NO_TIMER' | 'MID_COMBAT_ROLEPLAY';

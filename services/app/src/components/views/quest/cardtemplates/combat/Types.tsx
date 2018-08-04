import {Enemy, Loot} from 'app/reducers/QuestTypes';
import {DecisionPhase} from '../decision/Types';
import {ParserNode} from '../TemplateTypes';

export type SkillType = 'Athletics' | 'Knowledge' | 'Charisma';
export type DifficultyType = 'Easy' | 'Medium' | 'Hard';
export type PersonaType = 'Light' | 'Dark';
export const SKILL_TYPES: SkillType[] = ['Athletics', 'Knowledge', 'Charisma'];
export const DIFFICULTIES: DifficultyType[] = ['Easy', 'Medium', 'Hard'];
export const PERSONA_TYPES: PersonaType[] = ['Light', 'Dark'];

export interface CombatAttack {
  surge: boolean;
  damage: number;
}

export interface MidCombatPhase {
  enemies: Enemy[];
  mostRecentAttack?: CombatAttack;
  mostRecentRolls?: number[];
  decisionPhase: DecisionPhase;
  numAliveAdventurers: number;
  roundCount: number;
  tier: number;
  roleplay?: ParserNode;
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

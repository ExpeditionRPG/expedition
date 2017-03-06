import {randomPropertyValue} from '../constants'
import {encounters} from '../Encounters'

export interface QuestDetails {
  id?: string;
  xml?: string;
  publishedurl?: string;
  published?: string;
  title?: string,
  summary?: string,
  minplayers?: number,
  maxplayers?: number,
  email?: string,
  url?: string,
  mintimeminutes?: number,
  maxtimeminutes?: number,
  author?: string
};

export type QuestCardName = 'COMBAT' | 'ROLEPLAY';

export type DifficultyType = 'EASY' | 'NORMAL' | 'HARD' | 'IMPOSSIBLE';
export interface CombatDifficultySettings {
  roundTimeMillis: number,
  surgePeriod: number,
  damageMultiplier: number,
}

export type Enemy = {name: string, tier: number, class?: string};
export type Loot = {tier: number, count: number};

export interface QuestContext {
  // Scope is passed to the parser when rendering
  // nodes that are potentially parseable via MathJS.
  scope: any; //TODO: required fields later
}
export function defaultQuestContext(): QuestContext {
  // Caution: This is the API for Quest Creators. New endpoints should be
  // added carefully b/c we'll have to support them going forward.
  return {scope: {
    _: {
      randomEnemy: function(): string {
        return randomPropertyValue(encounters).name;
      },
      randomEnemyOfTier: function(tier: number): string {
        return randomPropertyValue(Object.assign({}, ...Object.keys(encounters)
            .filter( key => encounters[key].tier === tier )
            .map( key => ({ [key]: encounters[key] }) ) )).name;
      },
      randomEnemyOfClass: function(className: string): string {
        className = className.toLowerCase();
        return randomPropertyValue(Object.assign({}, ...Object.keys(encounters)
            .filter( key => encounters[key].class.toLowerCase() === className )
            .map( key => ({ [key]: encounters[key] }) ) )).name;
      },
      randomEnemyOfClassTier: function(className: string, tier: number): string {
        className = className.toLowerCase();
        return randomPropertyValue(Object.assign({}, ...Object.keys(encounters)
            .filter( key => encounters[key].tier === tier )
            .filter( key => encounters[key].class.toLowerCase() === className )
            .map( key => ({ [key]: encounters[key] }) ) )).name;
      },
    },
  }};
}

export interface Choice {
  text: string;
  idx: number;
}

export interface CombatAttack {
  surge: boolean;
  damage: number;
}

export interface Instruction {
  text: string;
  idx: number;
  icon?: string;
}

export type MidCombatPhaseNameType = 'DRAW_ENEMIES' | 'PREPARE' | 'TIMER' | 'SURGE' | 'RESOLVE_ABILITIES' | 'ENEMY_TIER' | 'PLAYER_TIER'
export type EndCombatPhaseNameType = 'VICTORY' | 'DEFEAT';
export function isCombatPhase(phase: string) : boolean {
  return ['DRAW_ENEMIES', 'PREPARE', 'TIMER', 'SURGE', 'RESOLVE_ABILITIES', 'ENEMY_TIER', 'PLAYER_TIER', 'VICTORY', 'DEFEAT'].indexOf(phase) !== -1;
}
export interface MidCombatPhase {
  enemies: Enemy[];
  mostRecentAttack?: CombatAttack;
  roundCount: number;
  numAliveAdventurers: number;
  tier: number;
}
export interface EndCombatPhase {
  levelUp?: boolean;
  loot?: Loot[];
}

export type CombatPhaseNameType = MidCombatPhaseNameType | EndCombatPhaseNameType;

export interface CombatState extends CombatDifficultySettings, MidCombatPhase, EndCombatPhase {}

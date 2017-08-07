import {encounters} from '../../Encounters'
import {Enemy, Loot} from '../../reducers/QuestTypes'
import {ParserNode} from '../../parser/Node'
import {isSurgeRound} from './Actions'

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
  roleplay?: ParserNode;
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

export type CombatPhase = 'DRAW_ENEMIES' | 'PREPARE' | 'TIMER' | 'SURGE' | 'RESOLVE_ABILITIES' | 'ENEMY_TIER' | 'PLAYER_TIER' | 'VICTORY' | 'DEFEAT' | 'ROLEPLAY';

export function combatScope() {
  return {
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
    currentCombatRound: function(): number {
      return this.templates.combat.roundCount || 0;
    },
    isCombatSurgeRound: function(): boolean {
      return isSurgeRound(this.templates.combat.roundCount, this.templates.combat.surgePeriod);
    },
  };
}

function randomPropertyValue(obj: any): any {
  const keys = Object.keys(obj);
  return obj[ keys[ Math.floor(keys.length * Math.random()) ] ];
};

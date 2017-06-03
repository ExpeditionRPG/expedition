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


export function combatScope() {
  return {
    randomEnemy: function(): string {
      const encounters = this.extern('encounters');
      return encounters[Math.floor(Object.keys(encounters).length * Math.random())].name;
    },
    randomEnemyOfTier: function(tier: number): string {
      const encounters = this.extern('encounters');
      const keys = Object.keys(encounters).filter( key => encounters[key].tier === tier );
      return encounters[Math.floor(keys.length * Math.random())].name;
    },
    randomEnemyOfClass: function(className: string): string {
      const encounters = this.extern('encounters');
      className = className.toLowerCase();
      const keys = Object.keys(encounters).filter( key => encounters[key].class.toLowerCase() === className );
      return encounters[Math.floor(keys.length * Math.random())].name;
    },
    randomEnemyOfClassTier: function(className: string, tier: number): string {
      const encounters = this.extern('encounters');
      className = className.toLowerCase();
      const keys = Object.keys(encounters)
          .filter( key => encounters[key].tier === tier )
          .filter( key => encounters[key].class.toLowerCase() === className );
      return encounters[Math.floor(keys.length * Math.random())].name;
    },
  };
}

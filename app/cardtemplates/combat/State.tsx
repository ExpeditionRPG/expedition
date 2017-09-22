import {encounters} from '../../Encounters'
import {Enemy, Loot} from '../../reducers/QuestTypes'
import {ParserNode} from '../Template'
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
  surgePeriod: number,
  damageMultiplier: number,
}

export interface CombatState extends CombatDifficultySettings, MidCombatPhase, EndCombatPhase {
  custom: boolean;
}

export function combatScope() {
  return {
    randomEnemy: function(): string {
      const contentSets = this.scope._.contentSets();
      return (randomPropertyValue(Object.assign({}, ...Object.keys(encounters)
          .filter( key => encounters[key].set === 'base' || contentSets[encounters[key].set])
          .map( key => ({ [key]: encounters[key] }) ) )
        ) || {}).name;
    },
    randomEnemyOfTier: function(tier: number): string {
      const contentSets = this.scope._.contentSets();
      return (randomPropertyValue(Object.assign({}, ...Object.keys(encounters)
          .filter( key => encounters[key].set === 'base' || contentSets[encounters[key].set])
          .filter( key => encounters[key].tier === tier )
          .map( key => ({ [key]: encounters[key] }) ) )
        ) || {}).name;
    },
    randomEnemyOfClass: function(className: string): string {
      const contentSets = this.scope._.contentSets();
      className = className.toLowerCase();
      return (randomPropertyValue(Object.assign({}, ...Object.keys(encounters)
          .filter( key => encounters[key].set === 'base' || contentSets[encounters[key].set])
          .filter( key => encounters[key].class.toLowerCase() === className )
          .map( key => ({ [key]: encounters[key] }) ) )
        ) || {}).name;
    },
    randomEnemyOfClassTier: function(className: string, tier: number): string {
      const contentSets = this.scope._.contentSets();
      className = className.toLowerCase();
      return (randomPropertyValue(Object.assign({}, ...Object.keys(encounters)
          .filter( key => encounters[key].set === 'base' || contentSets[encounters[key].set])
          .filter( key => encounters[key].tier === tier )
          .filter( key => encounters[key].class.toLowerCase() === className )
          .map( key => ({ [key]: encounters[key] }) ) )
        ) || {}).name;
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

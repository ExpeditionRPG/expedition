import {encounters} from '../../../../../Encounters'
import {Enemy, Loot} from '../../../../../reducers/QuestTypes'
import {isSurgeRound} from './Actions'

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
    aliveAdventurers: function(): number {
      return (this.templates && this.templates.combat && this.templates.combat.numAliveAdventurers) || 0;
    },
    currentCombatRound: function(): number {
      return (this.templates && this.templates.combat && this.templates.combat.roundCount) || 0;
    },
    currentCombatTier: function(): number {
      return (this.templates && this.templates.combat && this.templates.combat.tier) || 0;
    },
    isCombatSurgeRound: function(): boolean {
      if (!this.templates || !this.templates.combat) {
        return false;
      }
      return isSurgeRound(this.templates.combat.roundCount, this.templates.combat.surgePeriod);
    },
  };
}

function randomPropertyValue(obj: any): any {
  const keys = Object.keys(obj);
  return obj[ keys[ Math.floor(keys.length * Math.random()) ] ];
};

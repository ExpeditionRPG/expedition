import {ENCOUNTERS} from '../../../../../Encounters';
import {isSurgeRound} from './Actions';

export function combatScope() {
  return {
    randomEnemy(): string {
      const contentSets = this.scope._.contentSets();
      return (randomPropertyValue(Object.assign({}, ...Object.keys(ENCOUNTERS)
          .filter( (key) => ENCOUNTERS[key].set === 'base' || contentSets[ENCOUNTERS[key].set])
          .map( (key) => ({ [key]: ENCOUNTERS[key] }) ) )
        ) || {}).name;
    },
    randomEnemyOfTier(tier: number): string {
      const contentSets = this.scope._.contentSets();
      return (randomPropertyValue(Object.assign({}, ...Object.keys(ENCOUNTERS)
          .filter( (key) => ENCOUNTERS[key].set === 'base' || contentSets[ENCOUNTERS[key].set])
          .filter( (key) => ENCOUNTERS[key].tier === tier )
          .map( (key) => ({ [key]: ENCOUNTERS[key] }) ) )
        ) || {}).name;
    },
    randomEnemyOfClass(className: string): string {
      const contentSets = this.scope._.contentSets();
      className = className.toLowerCase();
      return (randomPropertyValue(Object.assign({}, ...Object.keys(ENCOUNTERS)
          .filter( (key) => ENCOUNTERS[key].set === 'base' || contentSets[ENCOUNTERS[key].set])
          .filter( (key) => ENCOUNTERS[key].class.toLowerCase() === className )
          .map( (key) => ({ [key]: ENCOUNTERS[key] }) ) )
        ) || {}).name;
    },
    randomEnemyOfClassTier(className: string, tier: number): string {
      const contentSets = this.scope._.contentSets();
      className = className.toLowerCase();
      return (randomPropertyValue(Object.assign({}, ...Object.keys(ENCOUNTERS)
          .filter( (key) => ENCOUNTERS[key].set === 'base' || contentSets[ENCOUNTERS[key].set])
          .filter( (key) => ENCOUNTERS[key].tier === tier )
          .filter( (key) => ENCOUNTERS[key].class.toLowerCase() === className )
          .map( (key) => ({ [key]: ENCOUNTERS[key] }) ) )
        ) || {}).name;
    },
    aliveAdventurers(): number {
      return (this.templates && this.templates.combat && this.templates.combat.numAliveAdventurers) || 0;
    },
    currentCombatRound(): number {
      return (this.templates && this.templates.combat && this.templates.combat.roundCount) || 0;
    },
    currentCombatTier(): number {
      return (this.templates && this.templates.combat && this.templates.combat.tier) || 0;
    },
    isCombatSurgeRound(): boolean {
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
}

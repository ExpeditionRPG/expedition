import {ENCOUNTERS} from 'app/Encounters';
import {isSurgeRound} from './Actions';

const seedrandom = require('seedrandom');

function supportedEnemies(scope: any): string[] {
  const contentSets = scope._.contentSets() || [];
  return Object.keys(ENCOUNTERS)
          .filter((key) => ENCOUNTERS[key].set === 'base' || contentSets[ENCOUNTERS[key].set]);
}

function pickRandom<T>(list: T[], rng: () => number = Math.random): T {
  return list[Math.floor(rng() * list.length)];
}

export function combatScope() {
  return {
    randomEnemy(): string {
      const options = supportedEnemies(this.scope);
      return ENCOUNTERS[pickRandom(options, this.scope._.crng)].name;
    },
    randomEnemyOfTier(tier: number): string {
      const options = supportedEnemies(this.scope).filter((key) => ENCOUNTERS[key].tier === tier);
      return (ENCOUNTERS[pickRandom(options, this.scope._.crng)] || {}).name;
    },
    randomEnemyOfClass(className: string): string {
      const options = supportedEnemies(this.scope).filter((key) => ENCOUNTERS[key].class.toLowerCase() === className);
      return (ENCOUNTERS[pickRandom(options, this.scope._.crng)] || {}).name;
    },
    randomEnemyOfClassTier(className: string, tier: number): string {
      const options = supportedEnemies(this.scope)
        .filter( (key) => ENCOUNTERS[key].tier === tier )
        .filter((key) => ENCOUNTERS[key].class.toLowerCase() === className);
      return (ENCOUNTERS[pickRandom(options, this.scope._.crng)] || {}).name;
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
    crng(): number { this.scope._.crng = seedrandom.alea(this.seed); return this.scope._.crng() },
  };
}

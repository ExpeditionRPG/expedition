import { ENCOUNTERS } from 'app/Encounters';
import { TemplateContext } from '../TemplateTypes';
import { isSurgeRound } from './Actions';

const seedrandom = require('seedrandom');

function supportedEnemies(scope: any): string[] {
  const contentSets = scope._.contentSets() || [];
  return Object.keys(ENCOUNTERS).filter(
    key => ENCOUNTERS[key].set === 'base' || contentSets[ENCOUNTERS[key].set],
  );
}

function pickRandom<T>(list: T[], rng: () => number = Math.random): T {
  return list[Math.floor(rng() * list.length)];
}

// The methods below are rebound to the quest context by evaluateOp()
// (see `ctx.scope._[k].bind(ctx)` in shared/parse/Context.tsx), so each one
// declares `this: TemplateContext`. Without it TypeScript infers `this` as the
// object literal itself, which has no `scope`, `templates` or `seed`.
export function combatScope() {
  return {
    randomEnemy(this: TemplateContext): string {
      const options = supportedEnemies(this.scope);
      return ENCOUNTERS[pickRandom(options, this.scope._.crng)].name;
    },
    randomEnemyOfTier(this: TemplateContext, tier: number): string {
      const options = supportedEnemies(this.scope).filter(
        key => ENCOUNTERS[key].tier === tier,
      );
      return (ENCOUNTERS[pickRandom(options, this.scope._.crng)] || {}).name;
    },
    randomEnemyOfClass(this: TemplateContext, className: string): string {
      className = className.toLowerCase();
      const options = supportedEnemies(this.scope).filter(
        key => ENCOUNTERS[key].class.toLowerCase() === className,
      );
      return (ENCOUNTERS[pickRandom(options, this.scope._.crng)] || {}).name;
    },
    randomEnemyOfClassTier(
      this: TemplateContext,
      className: string,
      tier: number,
    ): string {
      className = className.toLowerCase();
      const options = supportedEnemies(this.scope)
        .filter(key => ENCOUNTERS[key].tier === tier)
        .filter(key => ENCOUNTERS[key].class.toLowerCase() === className);
      return (ENCOUNTERS[pickRandom(options, this.scope._.crng)] || {}).name;
    },
    aliveAdventurers(this: TemplateContext): number {
      return (
        (this.templates &&
          this.templates.combat &&
          this.templates.combat.numAliveAdventurers) ||
        0
      );
    },
    currentCombatRound(this: TemplateContext): number {
      return (
        (this.templates &&
          this.templates.combat &&
          this.templates.combat.roundCount) ||
        0
      );
    },
    currentCombatTier(this: TemplateContext): number {
      return (
        (this.templates &&
          this.templates.combat &&
          this.templates.combat.tier) ||
        0
      );
    },
    isCombatSurgeRound(this: TemplateContext): boolean {
      if (!this.templates || !this.templates.combat) {
        return false;
      }
      return isSurgeRound(
        this.templates.combat.roundCount,
        this.templates.combat.surgePeriod,
      );
    },
    crng(this: TemplateContext): number {
      this.scope._.crng = seedrandom.alea(this.seed);
      return this.scope._.crng();
    },
  };
}

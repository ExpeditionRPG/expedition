import {ENCOUNTERS} from 'app/Encounters';
import {newMockStore} from 'app/Testing';
import {initialSettings} from 'app/reducers/Settings';
import {evaluateOp} from 'shared/parse/Context';

// We use defaultContext here instead of combatScope as the combat scope
// depends on templates and content sets within the broader context.
import {defaultContext} from '../Template';

describe('Combat State', () => {
  describe('combatScope', () => {
    describe('randomEnemy', () => {
      test('returns a random enemy name', () => {
        const store = newMockStore({});
        const ctx = defaultContext(store.getState);
        expect(evaluateOp('_.randomEnemy()', ctx) ).toEqual(jasmine.any(String));
        expect(ENCOUNTERS[evaluateOp('_.randomEnemy()', ctx).toLowerCase()]).toBeDefined();
      });

      test('only includes enemies in the currently enabled content sets', () => {
        // Impossible to test absolutely; but we can test with high confidence.
        // Horror enabled, future disabled.
        const store = newMockStore({settings: {...initialSettings, contentSets: {horror: true}}});
        for (let i = 0; i < 100; i++) {
          const ctx = defaultContext(store.getState);
          ctx.seed = i.toString(); // deterministic
          const pick = evaluateOp('_.randomEnemy()', ctx) ;
          expect(ENCOUNTERS[Object.keys(ENCOUNTERS).filter((key) => ENCOUNTERS[key].name === pick)[0]].set).toMatch(/horror|base/);
        }
      });

      test('varies within same (seeded) scope', () => {
        const store = newMockStore({});
        const ctx = defaultContext(store.getState);
        ctx.seed = '0';
        expect(evaluateOp('_.randomEnemy()', ctx) ).not.toEqual(evaluateOp('_.randomEnemy()', ctx) );
      });
    });

    describe('randomEnemyOfTier', () => {
      const store = newMockStore({});
      const ctx = defaultContext(store.getState);
      test('returns a random enemy name', () => {
        expect(evaluateOp('_.randomEnemyOfTier(1)', ctx) ).toEqual(jasmine.any(String));
        expect(ENCOUNTERS[evaluateOp('_.randomEnemyOfTier(1)', ctx) .toLowerCase()]).toBeDefined();
      });
      test('only includes enemies in the currently enabled content sets', () => {
        // Impossible to test absolutely; but we can test with high confidence.
        // Horror enabled, future disabled.
        const store = newMockStore({settings: {...initialSettings, contentSets: {horror: true}}});
        for (let i = 0; i < 100; i++) {
          const ctx = defaultContext(store.getState);
          ctx.seed = i.toString(); // deterministic
          const pick = evaluateOp('_.randomEnemyOfTier(1)', ctx) ;
          expect(ENCOUNTERS[Object.keys(ENCOUNTERS).filter((key) => ENCOUNTERS[key].name === pick)[0]].set).toMatch(/horror|base/);
        }
      });
    });

    describe('randomEnemyOfClass', () => {
      const store = newMockStore({});
      const ctx = defaultContext(store.getState);
      test('returns a random enemy name', () => {
        expect(evaluateOp('_.randomEnemyOfClass("bandit")', ctx) ).toEqual(jasmine.any(String));
        expect(ENCOUNTERS[evaluateOp('_.randomEnemyOfClass("bandit")', ctx).toLowerCase()]).toBeDefined();
      });
      test('is capitalization agnostic', () => {
        expect(evaluateOp('_.randomEnemyOfClass("BANdit")', ctx) ).toEqual(jasmine.any(String));
        expect(ENCOUNTERS[evaluateOp('_.randomEnemyOfClass("Bandit")', ctx).toLowerCase()]).toBeDefined();
      });
      test('does not include enemies in the horror set if horror set disabled', () => {
        const store = newMockStore({});
        const ctx = defaultContext(store.getState);
        expect(evaluateOp('_.randomEnemyOfClass("horror")', ctx)).toEqual(null);
      });
      test('includes enemies in the horror set if horror set enabled', () => {
        const store = newMockStore({settings: {...initialSettings, contentSets: {horror: true}}});
        const ctx = defaultContext(store.getState);
        expect(evaluateOp('_.randomEnemyOfClass("horror")', ctx)).not.toEqual(null);
      });
    });

    describe('randomEnemyOfClassTier', () => {
      test('returns a random enemy name', () => {
        const store = newMockStore({});
        const ctx = defaultContext(store.getState);
        expect(evaluateOp('_.randomEnemyOfClassTier("undead", 1)', ctx) ).toEqual(jasmine.any(String));
        expect(ENCOUNTERS[evaluateOp('_.randomEnemyOfClassTier("undead", 1)', ctx) .toLowerCase()]).toBeDefined();
      });
      test('only includes enemies in the currently enabled content sets', () => {
        const store = newMockStore({settings: {...initialSettings, contentSets: {horror: true}}});
        const ctx = defaultContext(store.getState);
        expect(evaluateOp('_.randomEnemyOfClassTier("undead", 1)', ctx)).toEqual(jasmine.any(String));
        expect(evaluateOp('_.randomEnemyOfClassTier("synth", 1)', ctx)).toEqual(null);
      });
    });

    describe('aliveAdventurers', () => {
      test('returns the numer of alive adventurers during combat', () => {
        const store = newMockStore({});
        const ctx = defaultContext(store.getState);
        ctx.templates.combat = {numAliveAdventurers: 3} as any;
        expect(evaluateOp("_.aliveAdventurers()", ctx)).toEqual(3);
      });
    });

    describe('currentCombatRound', () => {
      test('returns 0 on the first round / by default', () => {
        expect(evaluateOp('_.currentCombatRound()', defaultContext())).toEqual(0);
      });
      test('return 1 on the second round', () => {
        const store = newMockStore({});
        const ctx = defaultContext(store.getState);
        ctx.templates.combat = {roundCount: 1} as any;
        expect(evaluateOp('_.currentCombatRound()', ctx)).toEqual(1);
      });
    });

    describe('currentCombatTier', () => {
      test('returns 0 by default', () => {
        const store = newMockStore({});
        const ctx = defaultContext(store.getState);
        expect(evaluateOp('_.currentCombatTier()', ctx)).toEqual(0);
      });
      test('returns the current combat tier', () => {
        const store = newMockStore({});
        const ctx = defaultContext(store.getState);
        ctx.templates.combat = {tier: 7} as any;
        expect(evaluateOp('_.currentCombatTier()', ctx)).toEqual(7);
      });
    });

    describe('isCombatSurgeRound', () => {
      test('returns false if it is not a surge round / by default', () => {
        const store = newMockStore({});
        const ctx = defaultContext(store.getState);
        expect(evaluateOp('_.isCombatSurgeRound()', ctx)).toEqual(false);
      });
      test('returns true if it is a surge round', () => {
        const store = newMockStore({});
        const ctx = defaultContext(store.getState);
        ctx.templates.combat = {roundCount: 4, surgePeriod: 4} as any;
        expect(evaluateOp('_.isCombatSurgeRound()', ctx)).toEqual(true);
      });
    });
  });
});

import {ENCOUNTERS} from 'app/Encounters';
import {newMockStore} from 'app/Testing';
import {initialSettings} from 'app/reducers/Settings';
import {resolveCombat} from '../Params';

// We use defaultContext here instead of combatScope as the combat scope
// depends on templates and content sets within the broader context.
import {defaultContext} from '../Template';

describe('Combat State', () => {
  describe('combatScope', () => {
    describe('randomEnemy', () => {
      test('returns a random enemy name', () => {
        const store = newMockStore({});
        const scope = defaultContext(store.getState).scope;
        expect(scope._.randomEnemy()).toEqual(jasmine.any(String));
        expect(ENCOUNTERS[scope._.randomEnemy().toLowerCase()]).toBeDefined();
      });

      test('only includes enemies in the currently enabled content sets', () => {
        // Impossible to test absolutely; but we can test with high confidence.
        // Horror enabled, future disabled.
        const store = newMockStore({settings: {...initialSettings, contentSets: {horror: true}}});
        for (let i = 0; i < 100; i++) {
          const ctx = defaultContext(store.getState);
          ctx.seed = i; // deterministic
          const pick = ctx.scope._.randomEnemy();
          expect(ENCOUNTERS[Object.keys(ENCOUNTERS).filter((key) => ENCOUNTERS[key].name === pick)[0]].set).toMatch(/horror|base/);
        }
      });

      test('varies within same (seeded) scope', () => {
        const store = newMockStore({});
        const ctx = defaultContext(store.getState);
        ctx.seed = 0;
        expect(ctx.scope._.randomEnemy()).not.toEqual(ctx.scope._.randomEnemy());
      });
    });

    describe('randomEnemyOfTier', () => {
      const store = newMockStore({});
      const scope = defaultContext(store.getState).scope;
      test('returns a random enemy name', () => {
        expect(scope._.randomEnemyOfTier(1)).toEqual(jasmine.any(String));
        expect(ENCOUNTERS[scope._.randomEnemyOfTier(1).toLowerCase()]).toBeDefined();
      });
      test('only includes enemies in the currently enabled content sets', () => {
        // Impossible to test absolutely; but we can test with high confidence.
        // Horror enabled, future disabled.
        const store = newMockStore({settings: {...initialSettings, contentSets: {horror: true}}});
        for (let i = 0; i < 100; i++) {
          const ctx = defaultContext(store.getState);
          ctx.seed = i; // deterministic
          const pick = ctx.scope._.randomEnemyOfTier(1);
          expect(ENCOUNTERS[Object.keys(ENCOUNTERS).filter((key) => ENCOUNTERS[key].name === pick)[0]].set).toMatch(/horror|base/);
        }
      });
    });

    describe('randomEnemyOfClass', () => {
      const store = newMockStore({});
      const scope = defaultContext(store.getState).scope;
      test('returns a random enemy name', () => {
        expect(scope._.randomEnemyOfClass('bandit')).toEqual(jasmine.any(String));
        expect(ENCOUNTERS[scope._.randomEnemyOfClass('bandit').toLowerCase()]).toBeDefined();
      });
      test('is capitalization agnostic', () => {
        expect(scope._.randomEnemyOfClass('BANdit')).toEqual(jasmine.any(String));
        expect(ENCOUNTERS[scope._.randomEnemyOfClass('Bandit').toLowerCase()]).toBeDefined();
      });
      test('does not include enemies in the horror set if horror set disabled', () => {
        const store = newMockStore({});
        const scope = defaultContext(store.getState).scope;
        expect(scope._.randomEnemyOfClass('horror')).not.toBeDefined();
      });
      test('includes enemies in the horror set if horror set enabled', () => {
        const store = newMockStore({settings: {...initialSettings, contentSets: {horror: true}}});
        const scope = defaultContext(store.getState).scope;
        expect(scope._.randomEnemyOfClass('horror')).toBeDefined();
      });
    });

    describe('randomEnemyOfClassTier', () => {
      test('returns a random enemy name', () => {
        const store = newMockStore({});
        const scope = defaultContext(store.getState).scope;
        expect(scope._.randomEnemyOfClassTier('undead', 1)).toEqual(jasmine.any(String));
        expect(ENCOUNTERS[scope._.randomEnemyOfClassTier('undead', 1).toLowerCase()]).toBeDefined();
      });
      test('only includes enemies in the currently enabled content sets', () => {
        const store = newMockStore({settings: {...initialSettings, contentSets: {horror: true}}});
        const scope = defaultContext(store.getState).scope;
        expect(scope._.randomEnemyOfClassTier('undead', 1)).toEqual(jasmine.any(String));
        expect(scope._.randomEnemyOfClassTier('synth', 1)).not.toBeDefined();
      });
    });

    describe('aliveAdventurers', () => {
      test('returns the numer of alive adventurers during combat', () => {
        const store = newMockStore();
        const ctx = defaultContext(store.getState);
        ctx.templates.combat = {numAliveAdventurers: 3};
        expect(ctx.scope._.aliveAdventurers()).toEqual(3);
      });
    });

    describe('currentCombatRound', () => {
      test('returns 0 on the first round / by default', () => {
        const store = newMockStore({});
        const scope = defaultContext(store.getState).scope;
        expect(scope._.currentCombatRound()).toEqual(0);
      });
      test('return 1 on the second round', () => {
        const store = newMockStore();
        const ctx = defaultContext(store.getState);
        ctx.templates.combat = {roundCount: 1};
        expect(ctx.scope._.currentCombatRound()).toEqual(1);
      });
    });

    describe('currentCombatTier', () => {
      test('returns 0 by default', () => {
        const store = newMockStore({});
        const scope = defaultContext(store.getState).scope;
        expect(scope._.currentCombatTier()).toEqual(0);
      });
      test('returns the current combat tier', () => {
        const store = newMockStore();
        const ctx = defaultContext(store.getState);
        ctx.templates.combat = {tier: 7};
        expect(ctx.scope._.currentCombatTier()).toEqual(7);
      });
    });

    describe('isCombatSurgeRound', () => {
      test('returns false if it is not a surge round / by default', () => {
        const store = newMockStore({});
        const scope = defaultContext(store.getState).scope;
        expect(scope._.isCombatSurgeRound()).toEqual(false);
      });
      test('returns true if it is a surge round', () => {
        const store = newMockStore();
        const ctx = defaultContext(store.getState);
        ctx.templates.combat = {roundCount: 4, surgePeriod: 4};
        expect(ctx.scope._.isCombatSurgeRound()).toEqual(true);
      });
    });
  });
});

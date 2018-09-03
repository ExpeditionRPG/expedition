import {ENCOUNTERS} from 'app/Encounters';
import {defaultContext} from '../Template';

describe('Combat State', () => {
  describe('combatScope', () => {
    describe('randomEnemy', () => {
      const scope = defaultContext().scope;
      test('returns a random enemy name', () => {
        expect(scope._.randomEnemy()).toEqual(jasmine.any(String));
        expect(ENCOUNTERS[scope._.randomEnemy().toLowerCase()]).toBeDefined();
      });
      test('does not include enemies in the horror set if horror set disabled', () => {
        expect(scope._.randomEnemyOfClass('horror')).not.toBeDefined();
      });
      test.skip('includes enemies in the horror set if horror set enabled', () => { /* TODO */ });
      // TODO; mock scope._.contentSets()
    });

    describe('randomEnemyOfTier', () => {
      const scope = defaultContext().scope;
      test('returns a random enemy name', () => {
        expect(scope._.randomEnemyOfTier(1)).toEqual(jasmine.any(String));
        expect(ENCOUNTERS[scope._.randomEnemyOfTier(1).toLowerCase()]).toBeDefined();
      });
      test.skip('only includes enemies in the currently enabled content sets', () => { /* TODO */ });
    });

    describe('randomEnemyOfClass', () => {
      const scope = defaultContext().scope;
      test('returns a random enemy name', () => {
        expect(scope._.randomEnemyOfClass('bandit')).toEqual(jasmine.any(String));
        expect(ENCOUNTERS[scope._.randomEnemyOfClass('bandit').toLowerCase()]).toBeDefined();
      });
      test.skip('only includes enemies in the currently enabled content sets', () => { /* TODO */ });
    });

    describe('randomEnemyOfClassTier', () => {
      const scope = defaultContext().scope;
      test('returns a random enemy name', () => {
        expect(scope._.randomEnemyOfClassTier('undead', 1)).toEqual(jasmine.any(String));
        expect(ENCOUNTERS[scope._.randomEnemyOfClassTier('undead', 1).toLowerCase()]).toBeDefined();
      });
      test.skip('only includes enemies in the currently enabled content sets', () => { /* TODO */ });
    });

    describe('aliveAdventurers', () => {
      test.skip('returns the numer of alive adventurers when all alive', () => { /* TODO */ });
      // const scope = defaultContext().scope;
      // TODO; requires installing a fake store and changing settings
      // expect(scope._.aliveAdventurers()).toEqual(TEST_SETTINGS.numPlayers);

      test.skip('returns the numer of alive adventurers when some dead', () => { /* TODO */ });
    });

    describe('currentCombatRound', () => {
      test('returns 0 on the first round / by default', () => {
        const scope = defaultContext().scope;
        expect(scope._.currentCombatRound()).toEqual(0);
      });
      test.skip('return 1 on the second round', () => { /* TODO */ });
    });

    describe('currentCombatTier', () => {
      test('returns 0 by default', () => {
        const scope = defaultContext().scope;
        expect(scope._.currentCombatTier()).toEqual(0);
      });
      test.skip('returns the current combat tier', () => { /* TODO */ });
    });

    describe('isCombatSurgeRound', () => {
      test('returns false if it is not a surge round / by default', () => {
        const scope = defaultContext().scope;
        expect(scope._.isCombatSurgeRound()).toEqual(false);
      });
      test.skip('returns true if it is a surge round', () => { /* TODO */ });
    });
  });
});

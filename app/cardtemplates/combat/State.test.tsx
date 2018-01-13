
import {defaultContext} from '../Template'
import {encounters} from '../../Encounters'

describe('Combat State', () => {
  describe('combatScope', () => {
    describe('randomEnemy', () => {
      const scope = defaultContext().scope;
      it('returns a random enemy name', () => {
        expect(scope._.randomEnemy()).toEqual(jasmine.any(String));
        expect(encounters[scope._.randomEnemy().toLowerCase()]).toBeDefined();
      });
      it('does not include enemies in the horror set if horror set disabled', () => {
        expect(scope._.randomEnemyOfClass('horror')).not.toBeDefined();
      });
      it('includes enemies in the horror set if horror set enabled', () => {
        // TODO; requires installing a fake store and changing settings
      });
    });

    describe('randomEnemyOfTier', () => {
      const scope = defaultContext().scope;
      it('returns a random enemy name', () => {
        expect(scope._.randomEnemyOfTier(1)).toEqual(jasmine.any(String));
        expect(encounters[scope._.randomEnemyOfTier(1).toLowerCase()]).toBeDefined();
      });
      it('only includes enemies in the currently enabled content sets');
    });

    describe('randomEnemyOfClass', () => {
      const scope = defaultContext().scope;
      it('returns a random enemy name', () => {
        expect(scope._.randomEnemyOfClass('bandit')).toEqual(jasmine.any(String));
        expect(encounters[scope._.randomEnemyOfClass('bandit').toLowerCase()]).toBeDefined();
      });
      it('only includes enemies in the currently enabled content sets');
    });

    describe('randomEnemyOfClassTier', () => {
      const scope = defaultContext().scope;
      it('returns a random enemy name', () => {
        expect(scope._.randomEnemyOfClassTier('undead', 1)).toEqual(jasmine.any(String));
        expect(encounters[scope._.randomEnemyOfClassTier('undead', 1).toLowerCase()]).toBeDefined();
      });
      it('only includes enemies in the currently enabled content sets');
    });

  });
});

import {DifficultyType, FontSizeType} from '../../../../../reducers/StateTypes'
import {defaultContext} from '../Template'
import {encounters} from '../../../../../Encounters'

const TEST_SETTINGS = {
  audioEnabled: false,
  autoRoll: false,
  contentSets: {
    horror: false,
  },
  difficulty: 'NORMAL' as DifficultyType,
  experimental: false,
  fontSize: 'NORMAL' as FontSizeType,
  multitouch: true,
  numPlayers: 3,
  showHelp: true,
  timerSeconds: 10,
  vibration: true,
};

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
      it('includes enemies in the horror set if horror set enabled');
      // TODO; requires installing a fake store and changing settings
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

    describe('aliveAdventurers', () => {
      it('returns the numer of alive adventurers when all alive');
      // const scope = defaultContext().scope;
      // TODO; requires installing a fake store and changing settings
      // expect(scope._.aliveAdventurers()).toEqual(TEST_SETTINGS.numPlayers);

      it('returns the numer of alive adventurers when some dead');
    });

    describe('currentCombatRound', () => {
      it('returns 0 on the first round / by default', () => {
        const scope = defaultContext().scope;
        expect(scope._.currentCombatRound()).toEqual(0);
      });
      it('return 1 on the second round');
    });

    describe('currentCombatTier', () => {
      it('returns 0 by default', () => {
        const scope = defaultContext().scope;
        expect(scope._.currentCombatTier()).toEqual(0);
      });
      it('returns the current combat tier');
    });

    describe('isCombatSurgeRound', () => {
      it('returns false if it is not a surge round / by default', () => {
        const scope = defaultContext().scope;
        expect(scope._.isCombatSurgeRound()).toEqual(false);
      });
      it('returns true if it is a surge round');
    });
  });
});

import {Reducer} from '../Testing';
import history from './CombinedReducers';
import {AppStateWithHistory} from './StateTypes';

describe('History reducer', () => {
  describe('PUSH_HISTORY', () => {
    test.skip('appends returnable state to _history', () => { /* TODO */ });
  });
  describe('RETURN', () => {
    function setup(overrides?: AppStateWithHistory) {
      return Reducer(history).withState({
        _committed: {},
        _history: [{
          commitID: 5,
          card: {name: 'QUEST_CARD'},
        }],
        commitID: 6,
        card: {name: 'SPLASH_CARD'},
        ...overrides
      });
    }

    test.skip('pops history until node type present in RETURN is seen', () => { /* TODO */ });
    test.skip('pops history once if RETURN without target node', () => { /* TODO */ });
    test.skip('skips specified card types', () => { /* TODO */ });
    test('persists non-returnable state and overrides returnable state', () => {
      const result = setup().execute({type: 'RETURN'});
      expect(result).toEqual(jasmine.objectContaining({
          commitID: 6, // Persists
          card: {name: 'QUEST_CARD'} // Does not persist
        }));
    });
    test('does nothing when no history', () => {
      const result = setup({_history: []} as any).execute({type: 'RETURN'});
      expect(result).toEqual(jasmine.objectContaining({
          commitID: 6,
          card: {name: 'SPLASH_CARD'}
        }));
    })
  });
});

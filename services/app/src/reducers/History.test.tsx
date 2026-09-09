import { Reducer } from '../Testing';
import history from './CombinedReducers';
import { history as reduceHistory } from './History';
import { AppStateWithHistory } from './StateTypes';

describe('History reducer', () => {
  describe('PUSH_HISTORY', () => {
    test('appends returnable state to _history', () => {
      const state = {
        _history: [],
        card: { name: 'QUEST_CARD' },
        commitID: 8,
        multiplayer: { connected: true },
      } as any;
      const next = reduceHistory(state, { type: 'PUSH_HISTORY' });
      expect(next._history).toHaveLength(1);
      expect(next._history[0].card).toEqual(state.card);
      expect(next._history[0].commitID).toBeUndefined();
      expect(next._history[0].multiplayer).toBeUndefined();
      expect(next.commitID).toBe(8);
      expect(state._history).toEqual([]);
    });
  });
  describe('RETURN', () => {
    function setup(overrides?: AppStateWithHistory) {
      return Reducer(history).withState({
        _committed: {},
        _history: [
          {
            commitID: 5,
            card: { name: 'QUEST_CARD' },
          },
        ],
        commitID: 6,
        card: { name: 'SPLASH_CARD' },
        ...overrides,
      });
    }

    test('pops history until matching node is seen', () => {
      const old = {
        card: { name: 'QUEST_CARD' },
        quest: { node: { getTag: () => 'roleplay' }, details: { id: 'quest' } },
      };
      const recent = {
        card: { name: 'QUEST_CARD' },
        quest: { node: { getTag: () => 'combat' }, details: { id: 'quest' } },
      };
      const next = reduceHistory(
        { _history: [old, recent], commitID: 5 } as any,
        {
          type: 'RETURN',
          matchFn: (_name, node) => node.getTag() === 'roleplay',
        } as any,
      );
      expect(next.quest).toBe(old.quest);
      expect(next._history).toEqual([]);
      expect(next.commitID).toBe(5);
    });
    test('pops history once if RETURN without target node', () => {
      const result = setup().execute({ type: 'RETURN' });
      expect(result.card.name).toBe('QUEST_CARD');
      expect(result._history).toEqual([]);
    });
    test('skips specified card types', () => {
      const cards = ['SPLASH_CARD', 'QUEST_CARD', 'SETTINGS'].map(name => ({
        card: { name },
        quest: { details: { id: 'quest' } },
      }));
      const next = reduceHistory(
        { _history: cards } as any,
        { type: 'RETURN', matchFn: name => name !== 'SETTINGS' } as any,
      );
      expect(next.card.name).toBe('QUEST_CARD');
      expect(next._history).toEqual(cards.slice(0, 1));
    });
    test('returning before the oldest matching entry never loses the card', () => {
      const first = {
        card: { name: 'SPLASH_CARD' },
        quest: { details: { id: '' } },
      };
      const next = reduceHistory(
        { _history: [first] } as any,
        { type: 'RETURN', before: true } as any,
      );
      expect(next.card).toEqual(first.card);
      expect(next._history).toEqual([]);
    });
    test('persists non-returnable state and overrides returnable state', () => {
      const result = setup().execute({ type: 'RETURN' });
      expect(result).toEqual(
        expect.objectContaining({
          commitID: 6, // Persists
          card: { name: 'QUEST_CARD' }, // Does not persist
        }),
      );
    });
    test('does nothing when no history', () => {
      const result = setup({ _history: [] }).execute({ type: 'RETURN' });
      expect(result).toEqual(
        expect.objectContaining({
          commitID: 6,
          card: { name: 'SPLASH_CARD' },
        }),
      );
    });
  });
});

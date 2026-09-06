import { Quest } from 'shared/schema/Quests';
import { Reducer } from '../Testing';
import { UserQuestsState, UserQuestsType } from './StateTypes';
import { userquests } from './UserQuests';

function instance(id: string, title: string, lastPlayed: Date) {
  return {
    details: new Quest({
      author: 'Test Author',
      id,
      partition: 'expedition-public',
      publishedurl: 'http://example.com/' + id,
      summary: 'A test quest',
      title,
    }),
    lastPlayed,
  };
}

const T1 = new Date(1500000000000);
const T2 = new Date(1600000000000);

function stateWith(history: UserQuestsType): UserQuestsState {
  return { history };
}

describe('UserQuests reducer', () => {
  test('defaults to an empty history', () => {
    expect(userquests(undefined, { type: '@@INIT' })).toEqual({ history: {} });
  });

  test('ignores unknown actions', () => {
    const state = stateWith({ q1: instance('q1', 'Oust Albanus', T1) });
    expect(userquests(state, { type: 'NOT_A_REAL_ACTION' })).toBe(state);
  });

  describe('USER_QUESTS', () => {
    test('replaces the whole history', () => {
      const state = stateWith({ q1: instance('q1', 'Oust Albanus', T1) });
      const replacement = { q2: instance('q2', 'Mistress Malaise', T2) };
      const result = userquests(state, {
        type: 'USER_QUESTS',
        quests: replacement,
      } as any);
      expect(Object.keys(result.history)).toEqual(['q2']);
      expect(result.history.q1).toBeUndefined();
    });

    test('accepts an empty history', () => {
      const state = stateWith({ q1: instance('q1', 'Oust Albanus', T1) });
      Reducer(userquests)
        .withState(state)
        .expect({ type: 'USER_QUESTS', quests: {} } as any)
        .toReturnState({ history: {} });
    });
  });

  describe('USER_QUESTS_DELTA', () => {
    test('adds a new quest without dropping the existing ones', () => {
      const state = stateWith({ q1: instance('q1', 'Oust Albanus', T1) });
      const result = userquests(state, {
        type: 'USER_QUESTS_DELTA',
        delta: { q2: instance('q2', 'Mistress Malaise', T2) },
      } as any);
      expect(Object.keys(result.history).sort()).toEqual(['q1', 'q2']);
      expect(result.history.q1.details.title).toEqual('Oust Albanus');
      expect(result.history.q2.details.title).toEqual('Mistress Malaise');
    });

    test('deep-merges into an existing quest rather than replacing it', () => {
      const state = stateWith({ q1: instance('q1', 'Oust Albanus', T1) });
      const result = userquests(state, {
        type: 'USER_QUESTS_DELTA',
        delta: { q1: { lastPlayed: T2 } },
      } as any);
      expect(result.history.q1.lastPlayed).toEqual(T2);
      // The fields the delta did not mention survive the merge.
      expect(result.history.q1.details.title).toEqual('Oust Albanus');
      expect(result.history.q1.details.id).toEqual('q1');
    });

    test('an empty delta leaves the history intact', () => {
      const state = stateWith({ q1: instance('q1', 'Oust Albanus', T1) });
      const result = userquests(state, {
        type: 'USER_QUESTS_DELTA',
        delta: {},
      } as any);
      expect(Object.keys(result.history)).toEqual(['q1']);
      expect(result.history.q1.details.title).toEqual('Oust Albanus');
    });

    test('does not mutate the previous state', () => {
      const original = instance('q1', 'Oust Albanus', T1);
      const state = stateWith({ q1: original });
      const result = userquests(state, {
        type: 'USER_QUESTS_DELTA',
        delta: { q1: { lastPlayed: T2 } },
      } as any);
      expect(result).not.toBe(state);
      expect(state.history.q1).toBe(original);
      expect(state.history.q1.lastPlayed).toEqual(T1);
    });
  });
});

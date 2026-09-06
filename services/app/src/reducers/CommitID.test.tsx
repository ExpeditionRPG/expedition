import { setMultiplayerConnection } from '../multiplayer/Connection';
import { commitID } from './CommitID';
import { AppStateWithHistory } from './StateTypes';

// commitID() takes a third `combinedReduce` argument that it never invokes today;
// a passthrough keeps the call sites honest without asserting anything about it.
const noopCombine: any = (s: any) => s;

// Installs a stub multiplayer connection whose buffer answer we control.
// The real Connection sets up timers on construction, which a reducer test
// has no business doing.
function stubConnection(bufferedAtOrbelow: boolean) {
  const fn = jest.fn().mockReturnValue(bufferedAtOrbelow);
  setMultiplayerConnection({ bufferedAtOrbelow: fn } as any);
  return fn;
}

function stateWith(overrides: object): AppStateWithHistory {
  return ({
    card: { name: 'QUEST_CARD' },
    quest: { details: { title: 'In Flight' } },
    settings: { numLocalPlayers: 3 },
    multiplayer: { connected: true },
    ...overrides,
  } as any) as AppStateWithHistory;
}

describe('CommitID reducer', () => {
  beforeEach(() => {
    stubConnection(false);
  });

  test('passes through falsy state without throwing', () => {
    expect(
      commitID(undefined as any, { type: '@@INIT' }, noopCombine),
    ).toBeUndefined();
  });

  describe('lazy initialization', () => {
    test('seeds _committed and commitID when _committed is absent', () => {
      const state = stateWith({});
      const result = commitID(
        state,
        { type: 'SOME_UNRELATED_ACTION' },
        noopCombine,
      );
      expect(result.commitID).toEqual(0);
      expect(result._committed).toEqual({
        card: { name: 'QUEST_CARD' },
        quest: { details: { title: 'In Flight' } },
      });
    });

    test('excludes settings, multiplayer, commitID and _committed from the baseline', () => {
      const result = commitID(
        stateWith({}),
        { type: 'SOME_UNRELATED_ACTION' },
        noopCombine,
      );
      const committed = result._committed as any;
      expect(committed).not.toHaveProperty('settings');
      expect(committed).not.toHaveProperty('multiplayer');
      expect(committed).not.toHaveProperty('commitID');
      expect(committed).not.toHaveProperty('_committed');
    });

    test('leaves an existing _committed alone', () => {
      const committed = { card: { name: 'SPLASH_CARD' } } as any;
      const result = commitID(
        stateWith({ _committed: committed, commitID: 4 }),
        { type: 'SOME_UNRELATED_ACTION' },
        noopCombine,
      );
      expect(result._committed).toBe(committed);
      expect(result.commitID).toEqual(4);
    });
  });

  describe('MULTIPLAYER_SYNC / MULTIPLAYER_SESSION', () => {
    test('MULTIPLAYER_SYNC rebases the baseline onto current state and zeroes commitID', () => {
      const state = stateWith({
        commitID: 9,
        _committed: { card: { name: 'SPLASH_CARD' } } as any,
      });
      const result = commitID(state, { type: 'MULTIPLAYER_SYNC' }, noopCombine);
      expect(result.commitID).toEqual(0);
      expect(result._committed).toEqual({
        card: { name: 'QUEST_CARD' },
        quest: { details: { title: 'In Flight' } },
      });
    });

    test('MULTIPLAYER_SESSION rebases the baseline onto current state and zeroes commitID', () => {
      const state = stateWith({
        commitID: 9,
        _committed: { card: { name: 'SPLASH_CARD' } } as any,
      });
      const result = commitID(
        state,
        { type: 'MULTIPLAYER_SESSION' },
        noopCombine,
      );
      expect(result.commitID).toEqual(0);
      expect((result._committed as any).card).toEqual({ name: 'QUEST_CARD' });
    });
  });

  describe('MULTIPLAYER_COMMIT', () => {
    test('accepts the commit when nothing is buffered at or below the id', () => {
      const buffered = stubConnection(false);
      const state = stateWith({
        commitID: 3,
        _committed: { card: { name: 'SPLASH_CARD' } } as any,
      });
      const result = commitID(
        state,
        { type: 'MULTIPLAYER_COMMIT', id: 7 } as any,
        noopCombine,
      );
      expect(buffered).toHaveBeenCalledWith(7);
      expect(result.commitID).toEqual(7);
      expect(result._committed).toEqual({
        card: { name: 'QUEST_CARD' },
        quest: { details: { title: 'In Flight' } },
      });
    });

    test('skips the commit while actions are still in flight at or below the id', () => {
      stubConnection(true);
      const previouslyCommitted = { card: { name: 'SPLASH_CARD' } } as any;
      const state = stateWith({ commitID: 3, _committed: previouslyCommitted });
      const result = commitID(
        state,
        { type: 'MULTIPLAYER_COMMIT', id: 7 } as any,
        noopCombine,
      );
      expect(result).toBe(state);
      expect(result.commitID).toEqual(3);
      expect(result._committed).toBe(previouslyCommitted);
    });
  });

  describe('MULTIPLAYER_REJECT', () => {
    const committed = {
      card: { name: 'SPLASH_CARD' },
      quest: { details: { title: 'Committed' } },
      settings: { numLocalPlayers: 1 },
      multiplayer: { connected: false },
      commitID: 2,
      _committed: { card: { name: 'STALE' } },
    } as any;

    test('rolls game state back to the last committed snapshot', () => {
      const state = stateWith({ commitID: 7, _committed: committed });
      const result = commitID(
        state,
        { type: 'MULTIPLAYER_REJECT', id: 8, error: 'nope' } as any,
        noopCombine,
      );
      expect(result.card).toEqual({ name: 'SPLASH_CARD' });
      expect((result as any).quest).toEqual({
        details: { title: 'Committed' },
      });
    });

    test('does not roll back settings, multiplayer or commitID', () => {
      const state = stateWith({ commitID: 7, _committed: committed });
      const result = commitID(
        state,
        { type: 'MULTIPLAYER_REJECT', id: 8, error: 'nope' } as any,
        noopCombine,
      );
      expect(result.settings).toEqual({ numLocalPlayers: 3 });
      expect(result.multiplayer).toEqual({ connected: true });
      expect(result.commitID).toEqual(7);
    });

    test('keeps the committed snapshot available for a subsequent rejection', () => {
      const state = stateWith({ commitID: 7, _committed: committed });
      const first = commitID(
        state,
        { type: 'MULTIPLAYER_REJECT', id: 8, error: 'nope' } as any,
        noopCombine,
      );
      expect(first._committed).toBe(committed);
      const second = commitID(
        first,
        { type: 'MULTIPLAYER_REJECT', id: 9, error: 'nope' } as any,
        noopCombine,
      );
      expect(second.card).toEqual({ name: 'SPLASH_CARD' });
      expect(second._committed).toBe(committed);
    });
  });

  test('MULTIPLAYER_DISCONNECT drops the baseline and resets commitID', () => {
    const state = stateWith({
      commitID: 7,
      _committed: { card: { name: 'SPLASH_CARD' } } as any,
    });
    const result = commitID(
      state,
      { type: 'MULTIPLAYER_DISCONNECT' },
      noopCombine,
    );
    expect(result._committed).toBeUndefined();
    expect(result.commitID).toEqual(0);
  });

  describe('default', () => {
    test('advances the baseline for remote-inflight actions without touching commitID', () => {
      const state = stateWith({
        commitID: 7,
        _committed: { card: { name: 'SPLASH_CARD' } } as any,
      });
      const result = commitID(
        state,
        { type: 'QUEST_NODE', _inflight: 'remote' } as any,
        noopCombine,
      );
      expect(result).not.toBe(state);
      expect(result._committed).toEqual({
        card: { name: 'QUEST_CARD' },
        quest: { details: { title: 'In Flight' } },
      });
      expect(result.commitID).toEqual(7);
    });

    test('leaves state untouched for locally-inflight actions', () => {
      const state = stateWith({
        commitID: 7,
        _committed: { card: { name: 'SPLASH_CARD' } } as any,
      });
      const result = commitID(
        state,
        { type: 'QUEST_NODE', _inflight: 4 } as any,
        noopCombine,
      );
      expect(result).toBe(state);
      expect(result._committed).toEqual({ card: { name: 'SPLASH_CARD' } });
    });

    test('leaves state untouched for unknown actions', () => {
      const state = stateWith({
        commitID: 7,
        _committed: { card: { name: 'SPLASH_CARD' } } as any,
      });
      expect(commitID(state, { type: 'NOT_A_REAL_ACTION' }, noopCombine)).toBe(
        state,
      );
    });
  });
});

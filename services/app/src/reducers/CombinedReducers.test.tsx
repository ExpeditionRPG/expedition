import { Expansion } from 'shared/schema/Constants';
import { Reducer } from '../Testing';
import combinedReducers from './CombinedReducers';
import { AppStateWithHistory } from './StateTypes';

describe('CombinedReducers', () => {
  test('initializes state slices and preserves unrelated state on dialog change', () => {
    const initial = combinedReducers(undefined, { type: '@@INIT' });
    expect(initial._history).toEqual([]);
    expect(initial.settings.numLocalPlayers).toBeGreaterThan(0);
    expect(initial.multiplayer.connected).toBe(false);
    const next = combinedReducers(initial, {
      type: 'DIALOG_SET',
      dialogID: 'REPORT_ERROR',
      message: 'offline',
    } as any);
    expect(next.dialog).toEqual(
      expect.objectContaining({ open: 'REPORT_ERROR', message: 'offline' }),
    );
    expect(next.multiplayer).toBe(initial.multiplayer);
    expect(next.quest).toBe(initial.quest);
  });

  describe('search params follow settings', () => {
    // CHANGE_SETTINGS carries only a *delta* of contentSets; the settings
    // reducer merges it into the existing set. The search reducer therefore
    // has to see the merged result, not the action, or a player who enables
    // an expansion and goes straight to Quests searches with `expansions: []`
    // and never sees any expansion quest.
    function change(state: AppStateWithHistory, contentSets: object) {
      return combinedReducers(state, {
        type: 'CHANGE_SETTINGS',
        settings: { contentSets },
      } as any);
    }

    test('enabling an expansion adds it to the search params', () => {
      const initial = combinedReducers(undefined, { type: '@@INIT' });
      expect(initial.search.params.expansions).toEqual([]);

      const state = change(initial, { horror: true, future: true });
      expect(state.settings.contentSets).toEqual({
        horror: true,
        future: true,
      });
      expect(state.search.params.expansions).toEqual([
        Expansion.horror,
        Expansion.future,
      ]);
      expect(state.search.results).toBeNull();
    });

    test('a partial settings delta is merged before the params are derived', () => {
      let state = combinedReducers(undefined, { type: '@@INIT' });
      state = change(state, { horror: true });
      // Only `future` is in this delta; `horror` has to survive the merge.
      state = change(state, { future: true });
      expect(state.search.params.expansions).toEqual([
        Expansion.horror,
        Expansion.future,
      ]);
    });

    test('disabling an expansion removes it from the search params', () => {
      let state = combinedReducers(undefined, { type: '@@INIT' });
      state = change(state, { horror: true, future: true });
      state = change(state, { future: false });
      expect(state.search.params.expansions).toEqual([Expansion.horror]);
    });
  });
});

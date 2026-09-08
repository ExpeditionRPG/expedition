import { Expansion, Language } from 'shared/schema/Constants';
import { Quest } from 'shared/schema/Quests';
import { ChangeSettingsAction } from '../actions/ActionTypes';
import { getStorageString } from '../LocalStorage';
import { Reducer } from '../Testing';
import { initialSearch, search } from './Search';
import { initialSettings } from './Settings';
import { SearchState } from './StateTypes';
import { TEST_SEARCH } from './TestData';

// The search reducer is declared as taking a bare `Redux.Action`, so an inline
// literal with a `settings` field trips excess-property checking. Build the real
// action instead of casting it away -- what matters to these tests is the
// *settings* argument, not the action payload.
function changeSettings(): ChangeSettingsAction {
  return { settings: { contentSets: {} }, type: 'CHANGE_SETTINGS' };
}

function testQuest(id: string, title: string): Quest {
  return new Quest({
    author: 'Test Author',
    id,
    partition: 'expedition-public',
    publishedurl: 'http://example.com/' + id,
    summary: 'A test quest',
    title,
  });
}

const RESULTS = [
  testQuest('q1', 'Oust Albanus'),
  testQuest('q2', 'Mistress Malaise'),
];

function populated(overrides?: Partial<SearchState>): SearchState {
  return {
    ...initialSearch,
    results: RESULTS,
    searching: false,
    ...overrides,
  };
}

describe('Search reducer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('defaults to "not searched yet" with stored language and default params', () => {
    const state = search(undefined, { type: '@@INIT' });
    // null means "we have not searched", which the UI distinguishes from an empty result set.
    expect(state.results).toBeNull();
    expect(state.searching).toEqual(false);
    expect(state.params).toEqual({
      language: Language.english,
      order: '+ratingavg',
      showOfficial: false,
      showPrivate: true,
      text: '',
      expansions: [],
    });
  });

  test('ignores unknown actions', () => {
    const state = populated();
    expect(search(state, { type: 'NOT_A_REAL_ACTION' })).toBe(state);
  });

  test('CHANGE_SETTINGS invalidates results but keeps params and searching', () => {
    const state = populated({ searching: true });
    const result = search(state, {
      type: 'CHANGE_SETTINGS',
      settings: { contentSets: {} },
    } as any);
    expect(result.results).toBeNull();
    expect(result.params).toEqual(state.params);
    expect(result.searching).toEqual(true);
  });

  describe('expansion params follow settings', () => {
    test('initial params ask for the expansions stored in settings', () => {
      localStorage.setItem(
        'contentSets',
        JSON.stringify({ horror: true, future: true, scarredlands: false }),
      );
      jest.resetModules();
      const fresh = require('./Search').initialSearch as SearchState;
      expect(fresh.params.expansions).toEqual([
        Expansion.horror,
        Expansion.future,
      ]);
    });

    test('CHANGE_SETTINGS re-derives expansions from the resulting settings', () => {
      const state = populated({
        params: { ...initialSearch.params, expansions: [] },
      });
      const result = search(
        state,
        changeSettings(),
        {
          ...initialSettings,
          contentSets: { horror: true, future: true },
        },
      );
      expect(result.params.expansions).toEqual([
        Expansion.horror,
        Expansion.future,
      ]);
    });

    test('CHANGE_SETTINGS drops expansions the player no longer owns', () => {
      const state = populated({
        params: {
          ...initialSearch.params,
          expansions: [Expansion.horror, Expansion.future],
        },
      });
      const result = search(
        state,
        changeSettings(),
        { ...initialSettings, contentSets: { horror: true, future: false } },
      );
      expect(result.params.expansions).toEqual([Expansion.horror]);
    });
  });

  describe('SEARCH_CHANGE_PARAMS', () => {
    test('merges the delta into existing params and invalidates results', () => {
      const state = populated({
        params: { ...initialSearch.params, text: 'old', order: '+title' },
      });
      const result = search(state, {
        type: 'SEARCH_CHANGE_PARAMS',
        params: { text: 'goblins' },
      } as any);
      expect(result.params.text).toEqual('goblins');
      expect(result.params.order).toEqual('+title');
      expect(result.results).toBeNull();
    });

    test('replaces array params wholesale rather than concatenating', () => {
      const state = populated({
        params: { ...initialSearch.params, expansions: [Expansion.horror] },
      });
      const result = search(state, {
        type: 'SEARCH_CHANGE_PARAMS',
        params: { expansions: [Expansion.future] },
      } as any);
      expect(result.params.expansions).toEqual([Expansion.future]);
    });

    test('persists a language change to local storage', () => {
      search(initialSearch, {
        type: 'SEARCH_CHANGE_PARAMS',
        params: { language: Language.french },
      } as any);
      expect(getStorageString('language', 'UNSET')).toEqual(Language.french);
    });

    test('does not touch the stored language when the change omits it', () => {
      search(initialSearch, {
        type: 'SEARCH_CHANGE_PARAMS',
        params: { text: 'goblins' },
      } as any);
      expect(getStorageString('language', 'UNSET')).toEqual('UNSET');
    });

    test('tolerates a missing params payload', () => {
      const state = populated();
      const result = search(state, { type: 'SEARCH_CHANGE_PARAMS' } as any);
      expect(result.params).toEqual(state.params);
      expect(result.results).toBeNull();
    });
  });

  test('SEARCH_REQUEST clears results to null and flags searching', () => {
    Reducer(search)
      .withState(populated())
      .expect({ type: 'SEARCH_REQUEST' } as any)
      .toChangeState({ results: null, searching: true });
  });

  test('SEARCH_ERROR yields an empty result set, not a null one', () => {
    const result = search(populated({ results: null, searching: true }), {
      type: 'SEARCH_ERROR',
    } as any);
    // [] means "we searched and found nothing"; null would re-trigger a search.
    expect(result.results).toEqual([]);
    expect(result.results).not.toBeNull();
    expect(result.searching).toEqual(false);
  });

  describe('SEARCH_RESPONSE', () => {
    test('stores the returned quests and stops searching', () => {
      const result = search(populated({ results: null, searching: true }), {
        type: 'SEARCH_RESPONSE',
        quests: RESULTS,
        params: TEST_SEARCH,
      } as any);
      expect(result.results).toEqual(RESULTS);
      expect(result.searching).toEqual(false);
    });

    test('replaces params with the ones the server echoed back', () => {
      const result = search(
        populated({ params: { ...initialSearch.params, text: 'stale' } }),
        {
          type: 'SEARCH_RESPONSE',
          quests: [],
          params: TEST_SEARCH,
        } as any,
      );
      expect(result.params).toEqual(TEST_SEARCH);
      expect(result.params.text).toEqual('Test Text');
    });

    test('an empty response is distinguishable from a not-yet-searched state', () => {
      const result = search(populated({ results: null, searching: true }), {
        type: 'SEARCH_RESPONSE',
        quests: [],
        params: TEST_SEARCH,
      } as any);
      expect(result.results).toEqual([]);
      expect(result.results).not.toBeNull();
    });
  });
});

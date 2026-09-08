import Redux from 'redux';
import { Language } from 'shared/schema/Constants';
import {
  SearchChangeParamsAction,
  SearchResponseAction,
} from '../actions/ActionTypes';
import { getStorageString, setStorageKeyValue } from '../LocalStorage';
import { enabledExpansions, initialSettings } from './Settings';
import { SearchState, SettingsType } from './StateTypes';

const LANGUAGE_KEY = 'language';

export const initialSearch: SearchState = {
  results: null, // null = need to search; [] = no results
  params: {
    language: getStorageString(LANGUAGE_KEY, Language.english) as Language,
    order: '+ratingavg',
    showOfficial: false,
    showPrivate: true,
    text: '',
    // Derived from settings, not hardcoded to []: the expansions a player
    // owns are stored in localStorage and read back by initialSettings, so
    // the very first search of a session must already ask for them.
    expansions: enabledExpansions(initialSettings),
  },
  searching: false,
};

// `settings` is the *result* of running the settings reducer over the same
// action (see CombinedReducers). Search params for expansions are derived from
// the expansions the player owns; they used to be set only by
// ExpansionCheckbox.componentDidMount, so a player who enabled an expansion in
// Settings and went straight to Quests searched with `"expansions": []` and
// silently saw none of them.
export function search(
  state: SearchState = initialSearch,
  action: Redux.Action,
  settings: SettingsType = initialSettings,
): SearchState {
  switch (action.type) {
    case 'CHANGE_SETTINGS':
      // Clear results when invalidated, and re-derive which expansions to
      // search for. Widening or narrowing the owned content sets resets any
      // per-search narrowing, which is what the filter UI already showed.
      return {
        ...state,
        params: { ...state.params, expansions: enabledExpansions(settings) },
        results: null,
      };
    case 'SEARCH_CHANGE_PARAMS': {
      // Update params and clear results
      const changes = (action as SearchChangeParamsAction).params || {};
      if (changes.language) {
        setStorageKeyValue(LANGUAGE_KEY, changes.language);
      }
      return {
        ...state,
        params: { ...state.params, ...changes },
        results: null,
      };
    }
    case 'SEARCH_REQUEST':
      // Clear the searched quests if we're starting a new search.
      return { ...state, results: null, searching: true };
    case 'SEARCH_ERROR':
      return { ...state, results: [], searching: false };
    case 'SEARCH_RESPONSE':
      return {
        ...state,
        results: (action as SearchResponseAction).quests,
        params: (action as SearchResponseAction).params,
        searching: false,
      };
    default:
      return state;
  }
}

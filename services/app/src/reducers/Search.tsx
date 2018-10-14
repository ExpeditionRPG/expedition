import Redux from 'redux';
import {SearchChangeParamsAction, SearchResponseAction} from '../actions/ActionTypes';
import {setStorageKeyValue} from '../LocalStorage';
import {SearchState} from './StateTypes';

export const initialSearch: SearchState = {
  results: null, // null = need to search; [] = no results
  params: {
    language: 'English',
    order: '+ratingavg',
    text: '',
  },
  searching: false,
};

export function search(state: SearchState = initialSearch, action: Redux.Action): SearchState {
  switch (action.type) {
    case 'CHANGE_SETTINGS':
      // Clear results when invalidated.
      return {...state, results: null};
    case 'SEARCH_CHANGE_PARAMS':
      // Update params and clear results
      const changes = (action as SearchChangeParamsAction).params || {};
      Object.keys(changes).forEach((key: string) => {
        setStorageKeyValue(`search-${key}`, changes[key]);
      });
      return {...state, params: {...state.params, ...changes}, results: null};
    case 'SEARCH_REQUEST':
      // Clear the searched quests if we're starting a new search.
      return {...state, results: null, searching: true};
    case 'SEARCH_ERROR':
      return {...state, results: [], searching: false};
    case 'SEARCH_RESPONSE':
      return {...state,
        results: (action as SearchResponseAction).quests,
        params: (action as SearchResponseAction).params,
        searching: false,
      };
    default:
      return state;
  }
}

import Redux from 'redux';
import {SearchResponseAction} from '../actions/ActionTypes';
import {SearchState} from './StateTypes';

export const initialSearch: SearchState = {
  results: [],
  search: {
    language: 'English',
    order: '+ratingavg',
    text: '',
  },
  searching: false,
};

export function search(state: SearchState = initialSearch, action: Redux.Action): SearchState {
  switch (action.type) {
    case 'SEARCH_REQUEST':
      // Clear the searched quests if we're starting a new search.
      return {...state, results: [], searching: true};
    case 'SEARCH_ERROR':
      return {...state, searching: false};
    case 'SEARCH_RESPONSE':
      return {...state,
        results: (action as SearchResponseAction).quests,
        search: (action as SearchResponseAction).search,
        searching: false,
      };
    default:
      return state;
  }
}

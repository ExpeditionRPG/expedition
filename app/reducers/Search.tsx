import Redux from 'redux'
import {SearchResponseAction, ViewQuestAction, NavigateAction} from '../actions/ActionTypes'
import {SearchState} from './StateTypes'

export const initialSearch: SearchState = {
  search: {
    text: '',
    order: '-created',
    expansions: [],
  },
  selected: null,
  results: [],
  searching: false,
};

export function search(state: SearchState = initialSearch, action: Redux.Action): SearchState {
  switch(action.type) {
    case 'SEARCH_REQUEST':
      // Clear the searched quests if we're starting a new search.
      return {...state, results: [], selected: null, searching: true};
    case 'SEARCH_RESPONSE':
      return {...state,
        results: (action as SearchResponseAction).quests,
        search: (action as SearchResponseAction).search,
        searching: false,
      };
    case 'VIEW_QUEST':
      return {...state, selected: (action as ViewQuestAction).quest};
    default:
      return state;
  }
}

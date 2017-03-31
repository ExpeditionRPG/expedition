import Redux from 'redux'
import {NavigateAction, SearchResponseAction, ViewQuestAction} from '../actions/ActionTypes'
import {SearchState, isSearchPhase} from './StateTypes'

export const initial_state: SearchState = {
  search: {
    text: '',
    age: 'inf',
    order: '-created',
    owner: 'anyone',
  },
  selected: null,
  results: []
};

export function search(state: SearchState = initial_state, action: Redux.Action): SearchState {
  switch(action.type) {
    case 'SEARCH_RESPONSE':
      return {...state,
        results: (action as SearchResponseAction).quests,
        search: (action as SearchResponseAction).search,
      };
    case 'VIEW_QUEST':
      return {...state, selected: (action as ViewQuestAction).quest};
    default:
      return state;
  }
}

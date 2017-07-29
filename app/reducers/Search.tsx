import Redux from 'redux'
import {SearchResponseAction, ViewQuestAction} from '../actions/ActionTypes'
import {SearchState} from './StateTypes'

export const initial_state: SearchState = {
  search: {
    text: '',
    age: null,
    order: '-created',
    genre: null,
    contentrating: null,
    mintimeminutes: null,
    maxtimeminutes: null,
  },
  selected: {},
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

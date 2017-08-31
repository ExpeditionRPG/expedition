import Redux from 'redux'
import {SearchResponseAction, ViewQuestAction, NavigateAction} from '../actions/ActionTypes'
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
    case 'NAVIGATE':
      // When viewing private quests, clear the searched quests first.
      const nav = (action as NavigateAction);
      if (nav.to && nav.to.name === 'SEARCH_CARD' && nav.to.phase === 'PRIVATE') {
        return initial_state;
      }
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

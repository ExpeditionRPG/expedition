import {NavigateAction, SearchResponseAction, ViewQuestAction} from '../actions/ActionTypes'
import {SearchState, isSearchPhase} from './StateTypes'

const initial_state: SearchState = {
  search: {
    text: "",
    age: "inf",
    order: "-published",
    owner: "anyone",
  },
  selected: null,
  results: []
};

export function search(state: SearchState = initial_state, action: Redux.Action): SearchState {
  switch(action.type) {
    case 'SEARCH_RESPONSE':
      return Object.assign({}, state, {results: (action as SearchResponseAction).quests});
    case 'VIEW_QUEST':
      return Object.assign({}, state, {selected: (action as ViewQuestAction).quest});
    default:
      return state;
  }
}
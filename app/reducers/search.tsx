import {NavigateAction} from '../actions/ActionTypes'
import {SearchState, isSearchPhase} from './StateTypes'

const initial_state: SearchState = {
  phase: "DISCLAIMER",
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
    case 'NAVIGATE':
      let phase = (action as NavigateAction).phase;
      if (isSearchPhase(phase)) {
        return Object.assign({}, state, {phase});
      }
    default:
      return state;
  }
}
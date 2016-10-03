import { card } from './card'
import { quest } from './quest'
import { settings } from './settings'
import { search } from './search'
import { user } from './user'
import { AppState } from './StateTypes'
import { ReturnAction } from '../actions/ActionTypes'


export interface AppStateWithHistory extends AppState {
  _history: AppState[];
  _return: boolean;
}

export default function combinedReducerWithHistory(state: AppStateWithHistory, action: Redux.Action): Object {
  let history: AppState[] = [];

  if (state !== undefined) {
    if (state._history === undefined) {
      state._history = [];
    }
    // If action is "Return", pop history accordingly
    if (action.type === 'RETURN') {
      let pastStateIdx: number = state._history.length-1;

      let returnAction = action as ReturnAction;
      if (returnAction.to) {
        while(pastStateIdx > 0 && state._history[pastStateIdx].card.name !== returnAction.to) {
          pastStateIdx--;
        }
      }
      if (returnAction.before) {
        pastStateIdx--;
      }

      let newState: AppStateWithHistory = Object.assign({}, state._history[pastStateIdx]);
      newState._history = state._history.slice(0, pastStateIdx);
      newState.settings = state.settings; // global settings should not be rewound.
      newState._return = true;
      return newState;
    }

    history = Object.assign([], state._history);
    if (action.type === 'NAVIGATE') {
      // Otherwise, save a copy of existing state to _history whenever we go to a new card
      history.push(Object.assign({}, state, {_history: undefined, _return: undefined, settings: undefined}));
    }
  }

  // Run the reducers on the new action
  let newState: AppStateWithHistory = {
    _history: history,
    _return: false,
    card: card(state.card, action),
    quest: quest(state, action),
    settings: settings(state.settings, action),
    search: search(state.search, action),
    user: user(state.user, action),
  };
  return newState;
}
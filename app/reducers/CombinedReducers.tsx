import {card} from './card'
import {quest} from './quest'
import {settings} from './settings'
import {search} from './search'
import {combat} from './combat'
import {user} from './user'
import {AppStateWithHistory, AppState} from './StateTypes'
import {ReturnAction} from '../actions/ActionTypes'

function combinedReduce(state: AppStateWithHistory, action: Redux.Action): AppState {
  return {
    card: card(state.card, action),
    quest: quest(state.quest, action),
    combat: combat(state.combat, action),
    settings: settings(state.settings, action),
    search: search(state.search, action),
    user: user(state.user, action),
  };
}

function isReturnState(state: AppState, action: ReturnAction): boolean {
  let matchesName = state.card.name === action.to;
  let matchesCombatPhase = (action.phase && state.combat && action.phase === state.combat.phase);
  let matchesSearchPhase = (action.phase && state.search && action.phase === state.search.phase);
  return (matchesName && (!action.phase || matchesCombatPhase || matchesSearchPhase));
}

export default function combinedReducerWithHistory(state: AppStateWithHistory, action: Redux.Action): AppStateWithHistory {
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
        while(pastStateIdx > 0 && !isReturnState(state._history[pastStateIdx], returnAction)) {
          pastStateIdx--;
        }
      }
      if (returnAction.before) {
        pastStateIdx--;
      }

      return Object.assign({}, state._history[pastStateIdx], {
        _history: state._history.slice(0, pastStateIdx),
        settings: state.settings, // global settings should not be rewound.
        _return: true}) as AppStateWithHistory;
    }

    history = state._history.slice();
    if (action.type === 'NAVIGATE') {
      // Otherwise, save a copy of existing state to _history whenever we go to a new card
      history.push(Object.assign(state, {_history: undefined, _return: undefined, settings: undefined}) as AppStateWithHistory);
    }
  }

  // Run the reducers on the new action
  return Object.assign(combinedReduce(state, action), {_history: history, _return: false}) as AppStateWithHistory;
}
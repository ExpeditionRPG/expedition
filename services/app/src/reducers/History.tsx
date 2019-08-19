import Redux from 'redux';
import {ReturnAction} from '../actions/ActionTypes';
import {getHistoryApi, getNavigator} from '../Globals';
import {AppStateBase, AppStateWithHistory} from './StateTypes';

export function history(state: AppStateWithHistory, action: Redux.Action): AppStateWithHistory {
  if (state._history === undefined) {
    state._history = [];
  }

  // If action is "Return", pop history accordingly
  if (action.type === 'RETURN') {
    // Backing all the way out of the Android app should kill it
    if (state._history.length === 0) {
      const navigator = getNavigator();
      if (navigator.app) {
          navigator.app.exitApp();
      } else if (navigator.device) {
          navigator.device.exitApp();
      }
      return state;
    }

    let pastStateIdx: number = state._history.length - 1;
    const returnAction = action as ReturnAction;
    if (returnAction.matchFn) {
      while (pastStateIdx > 0 && !returnAction.matchFn(state._history[pastStateIdx].card.name, state._history[pastStateIdx].quest.node)) {
        pastStateIdx--;
      }
    }

    if (returnAction.before) {
      pastStateIdx--;
    }

    // If we're going back to a point where the quest is no longer defined, clear the URL hash
    if (pastStateIdx === 0 ||
       (state._history[pastStateIdx - 1] && state._history[pastStateIdx - 1].quest && state._history[pastStateIdx - 1].quest.details.id === '')) {
      getHistoryApi().pushState(null, '', '#');
    }

    return {
      ...state._history[pastStateIdx],
      _committed: state._committed,
      _history: state._history.slice(0, pastStateIdx),
      _return: true,
      // things that should persist / not be rewound:
      audioData: state.audioData,
      commitID: state.commitID,
      multiplayer: state.multiplayer,
      saved: state.saved,
      search: state.search,
      serverstatus: state.serverstatus,
      settings: state.settings,
      user: state.user,
      snackbar: state.snackbar,
      userQuests: state.userQuests,
    } as AppStateWithHistory;
  }

  if (action.type === 'CLEAR_HISTORY') {
    return {...state, _return: false, _history: []};
  }

  // Create a new array (objects may be shared)
  const stateHistory: AppStateBase[] = state._history.slice();

  if (action.type === 'PUSH_HISTORY') {
    // Save a copy of existing state to _history, excluding non-historical fields.
    stateHistory.push({
      ...state,
      _committed: undefined,
      _history: undefined,
      _return: undefined,
      audioData: undefined,
      commitID: undefined,
      multiplayer: undefined,
      saved: undefined,
      search: undefined,
      serverstatus: undefined,
      settings: undefined,
      user: undefined,
      snackbar: undefined,
      userQuests: undefined,
    } as AppStateBase);
  }
  return {...state, _return: false, _history: stateHistory};
}

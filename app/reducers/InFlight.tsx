import {InflightCommitAction} from '../actions/ActionTypes'
import Redux from 'redux'
import {AppStateWithHistory} from './StateTypes'
import {getMultiplayerClient} from '../Multiplayer'

export function stripMultiplayerStateAndSettings(state: AppStateWithHistory): AppStateWithHistory {
  const newState = {...state};
  delete newState._committed;
  delete newState.settings;
  delete newState.remotePlay;
  return newState;
}

export function inflight(state: AppStateWithHistory, action: Redux.Action, combinedReduce: Redux.Reducer<any>): AppStateWithHistory {
  if (!state) {
    return state;
  }
  if (state._committed === undefined) {
    state._committed = stripMultiplayerStateAndSettings(state);
    state.commitID = 0;
  }

  switch(action.type) {
    case 'MULTIPLAYER_SESSION':
      // Initialize committed state
      return {...state, _committed: stripMultiplayerStateAndSettings(state), commitID: 0};
    case 'INFLIGHT_COMMIT':
      // When no actions are in flight, we're at the correct state.
      // This should almost always happen within a couple actions.
      // TODO: error/alert if this takes too long
      const id = (action as InflightCommitAction).id;
      if (getMultiplayerClient().getInFlightAtOrBelow(id).length === 0) {
        return {
          ...state,
          _committed: stripMultiplayerStateAndSettings(state),
          commitID: id,
        } as AppStateWithHistory;
      }
      console.warn('Skipping commit; inflight at or below #' + id);
      return state;
    case 'INFLIGHT_COMPACT':
      console.log('INFLIGHT COMPACT');
      return {
        ...state,
        ...stripMultiplayerStateAndSettings({...state._committed}),
      };
    case 'MULTIPLAYER_DISCONNECT':
      return {...state, _committed: undefined, commitID: 0};
    default:
      if ((action as any)._inflight === 'remote') {
        return {
          ...state,
          _committed: stripMultiplayerStateAndSettings(state),
        };
      }
      return state;
  }
}

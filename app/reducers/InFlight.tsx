import {InflightCommitAction, InflightRejectAction} from '../actions/ActionTypes'
import Redux from 'redux'
import {AppStateWithHistory, AppState} from './StateTypes'
import {getRemotePlayClient} from '../RemotePlay'

export function stripRemoteStateAndSettings(state: AppStateWithHistory): AppStateWithHistory {
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
    state._committed = stripRemoteStateAndSettings(state);
    state.commitID = 0;
  }

  switch(action.type) {
    case 'REMOTE_PLAY_SESSION':
      // Initialize committed state
      return {...state, _committed: stripRemoteStateAndSettings(state), commitID: 0};
    case 'INFLIGHT_COMMIT':
      // When no actions are in flight, we're at the correct state.
      // This should almost always happen within a couple actions.
      // TODO: error/alert if this takes too long
      const id = (action as InflightCommitAction).id;
      if (getRemotePlayClient().getInFlightAtOrBelow(id).length === 0) {
        return {
          ...state,
          _committed: stripRemoteStateAndSettings(state),
          commitID: id,
        } as AppStateWithHistory;
      } else {
        console.warn('Skipping commit; inflight at or below #' + id);
        return state;
      }
    case 'INFLIGHT_COMPACT':
      console.log('INFLIGHT COMPACT');
      return {
        ...state,
        ...stripRemoteStateAndSettings({...state._committed}),
      };
    case 'REMOTE_PLAY_DISCONNECT':
      return {...state, _committed: undefined, commitID: 0};
    default:
      if ((action as any)._inflight === 'remote') {
        return {
          ...state,
          _committed: stripRemoteStateAndSettings(state),
        };
      }
      return state;
  }
}

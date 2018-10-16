import Redux from 'redux';
import {MultiplayerCommitAction} from '../actions/ActionTypes';
import {getMultiplayerClient} from '../Multiplayer';
import {AppStateWithHistory} from './StateTypes';

function stripMultiplayerStateAndSettings(state: AppStateWithHistory): AppStateWithHistory {
  const newState = {...state};
  delete newState._committed;
  delete newState.settings;
  delete newState.multiplayer;
  delete newState.commitID;
  return newState;
}

export function commitID(state: AppStateWithHistory, action: Redux.Action, combinedReduce: Redux.Reducer<any>): AppStateWithHistory {
  if (!state) {
    return state;
  }
  if (state._committed === undefined) {
    state._committed = stripMultiplayerStateAndSettings(state);
    state.commitID = 0;
  }

  switch (action.type) {
    case 'MULTIPLAYER_SYNC':
    case 'MULTIPLAYER_SESSION':
      // Initialize committed state
      return {
        ...state,
        _committed: stripMultiplayerStateAndSettings(state),
        commitID: 0,
      };
    case 'MULTIPLAYER_COMMIT':
      // When no actions are in flight, we're at the correct state.
      // This should almost always happen within a couple actions.
      // TODO: error/alert if this takes too long
      const id = (action as MultiplayerCommitAction).id;
      if (getMultiplayerClient().getInFlightAtOrBelow(id).length === 0) {
        return {
          ...state,
          _committed: stripMultiplayerStateAndSettings(state),
          commitID: id,
        } as AppStateWithHistory;
      }
      console.warn('Skipping commit; commitID at or below #' + id);
      return state;
    case 'MULTIPLAYER_REJECT':
      // Restore previous known good state.
      console.log('MULTIPLAYER REJECT');
      return {
        ...state,
        ...stripMultiplayerStateAndSettings({...state._committed}),
        commitID: state.commitID,
      };
    case 'MULTIPLAYER_DISCONNECT':
      return {
        ...state,
        _committed: undefined,
        commitID: 0,
      };
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

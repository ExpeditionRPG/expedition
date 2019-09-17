import Redux from 'redux';
import {MultiplayerCommitAction} from '../actions/ActionTypes';
import {AppStateWithHistory} from './StateTypes';

export function commitID(state: AppStateWithHistory, action: Redux.Action, combinedReduce: Redux.Reducer<any>): AppStateWithHistory {
  if (!state) {
    return state;
  }
  if (state.commitID === undefined) {
    state.commitID = 0;
  }

  switch (action.type) {
    case 'MULTIPLAYER_SYNC':
    case 'MULTIPLAYER_SESSION':
      // Initialize committed state
      return {
        ...state,
        commitID: 0,
      };
    case 'MULTIPLAYER_COMMIT':
      // When no actions are in flight, we're at the correct state.
      // This should almost always happen within a couple actions.
      // We still take the max in case messages arrive out of order
      // (due to connection losses)
      // TODO: error/alert if this takes too long
      const id = (action as MultiplayerCommitAction).id;
      const commitID = Math.max(state.commitID, id);
      console.log('Commit ID', commitID);
      return {
        ...state,
        commitID,
      } as AppStateWithHistory;
    case 'MULTIPLAYER_DISCONNECT':
      return {
        ...state,
        commitID: 0,
      };
    default:
      if ((action as any)._inflight === 'remote') {
        return {
          ...state,
        };
      }
      return state;
  }
}

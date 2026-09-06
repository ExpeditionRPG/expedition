import Redux from 'redux';
import { MultiplayerCommitAction } from '../actions/ActionTypes';
import { getMultiplayerConnection } from '../multiplayer/Connection';
import { AppStateWithHistory } from './StateTypes';

// The snapshot deliberately drops the per-client settings and the
// multiplayer/commit bookkeeping, so it is a subset of the state, not a whole
// one -- `_committed` is typed to match.
function stripMultiplayerStateAndSettings(
  state: Partial<AppStateWithHistory>,
): Partial<AppStateWithHistory> {
  const { _committed, settings, multiplayer, commitID, ...rest } = state;
  return rest;
}

export function commitID(
  state: AppStateWithHistory,
  action: Redux.Action,
  combinedReduce: Redux.Reducer<any>,
): AppStateWithHistory {
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
    case 'MULTIPLAYER_COMMIT': // TODO: error/alert if this takes too long // This should almost always happen within a couple actions. // When no actions are in flight, we're at the correct state.
    {
      const id = (action as MultiplayerCommitAction).id;
      if (!getMultiplayerConnection().bufferedAtOrbelow(id)) {
        return {
          ...state,
          _committed: stripMultiplayerStateAndSettings(state),
          commitID: id,
        };
      }
      console.warn('Skipping commit; commitID at or below #' + id);
      return state;
    }
    case 'MULTIPLAYER_REJECT':
      // Restore previous known good state.
      console.log('MULTIPLAYER REJECT');
      return {
        ...state,
        ...stripMultiplayerStateAndSettings({ ...state._committed }),
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

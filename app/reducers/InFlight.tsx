import {InflightCommitAction, InflightRejectAction} from '../actions/ActionTypes'
import Redux from 'redux'
import {AppStateWithHistory, AppState} from './StateTypes'

export function stripRemoteStateAndSettings(state: AppStateWithHistory): AppStateWithHistory {
  const newState = {...state};
  delete newState._inflight;
  delete newState._committed;
  delete newState.settings;
  delete newState.remotePlay;
  return newState;
}

export function inflight(state: AppStateWithHistory, action: Redux.Action, combinedReduce: Redux.Reducer<any>): AppStateWithHistory {
  if (!state) {
    return state;
  }
  if (state._inflight === undefined || state._committed === undefined) {
    // We store local (and remote) actions as in-flight until the oldest in-flight action's
    // transaction is either confirmed or rejected.
    // Thus, the current redux state (excluding _committed and _inflight)
    // is simply a derived view of the latest _committed with a combinedReduce() chain applied across all
    // in-flight actions.
    // TODO: How to handle actions with side effects?!?! Vibration & sound... Use a sideEffect() function wrapper?
    state._inflight = [];
    state._committed = stripRemoteStateAndSettings(state);
  }

  switch(action.type) {
    case 'REMOTE_PLAY_SESSION':
      // Initialize committed state
      return {...state, _committed: stripRemoteStateAndSettings(state)};
    case 'INFLIGHT_COMMIT':
      console.log('got INFLIGHT_COMMIT');
      let found = false;
      let consecutiveCommits = 0;
      let consecutive = true;
      for (const a of state._inflight) {
        if (a.id === (action as InflightCommitAction).id) {
          a.committed = true;
          found = true;
        }
        consecutive = consecutive && a.committed;
        if (consecutive) {
          consecutiveCommits++;
        }
      }

      if (!found) {
        console.error('Commit status received for unknown inflight action ' + (action as InflightCommitAction).id);
        break;
      }
      // When all actions have been committed, we're already at the correct state.
      // This should almost always happen within a couple actions.
      // TODO: error/alert when inflight queue is long.
      if (consecutiveCommits === state._inflight.length) {
        return {
          ...state,
          _inflight: [],
          _committed: stripRemoteStateAndSettings(state),
        } as AppStateWithHistory;
      } else {
        return state;
      }
    case 'INFLIGHT_REJECT':
      // If a transaction has failed (e.g. due to conflict with other player actions),
      // we strike it from the actions queue.
      // Note that we continue in the aborted state until INFLIGHT_COMPACT is fired.
      // This allows for UX indicators when we eventually mutate state to correct the
      // rejected transaction.
      const id = (action as InflightRejectAction).id;
      console.log('INFLIGHT_REJECT id ' + id);
      const newInflight = [...state._inflight];
      for (let i = 0; i < newInflight.length; i++) {
        if (newInflight[i].id === id) {
          newInflight.splice(i, 1);
          i--;
        }
      }
      if (newInflight.length >= state._inflight.length) {
        console.error('Reject status received for unknown inflight action ' + (action as InflightCommitAction).id);
      } else {
        return {
          ...state,
          _inflight: newInflight
        };
      }
      break;
    case 'INFLIGHT_COMPACT':
      console.log('INFLIGHT COMPACT');
      // Run through inflight actions until encountering one that isn't committed. That's our new
      // committed state.
      // TODO: also count as committed any inflight actions older than ~10 seconds
      let newCommitted = {...state._committed};
      for (let i = 0; i < state._inflight.length && state._inflight[i].committed; i++) {
        newCommitted = combinedReduce(newCommitted, state._inflight[i].action);
      }

      return {
        ...state,
        ...stripRemoteStateAndSettings(newCommitted),
        _inflight: [],
        // _committed is updated in CombinedReducers whenever _inflight is empty
      };
    case 'REMOTE_PLAY_DISCONNECT':
      return {...state, _committed: undefined, _inflight: undefined};
    default:
      // Add all other actions to the inflight queue if
      // there's uncommitted actions.
      if (!(action as any)._inflight || (action as any)._inflight === 'remote' && state._inflight.length > 0) {
        // We still need to add other peers' remote actions to the inflight queue to handle
        // the chain of events where:
        // 1. Client publishes an action
        // 2. Remote peer's conflicting action arrives, delayed
        // 3. INFLIGHT_REJECT is returned for client's action in #1
        return {
          ...state,
          _inflight: [...state._inflight, {
            id: (action as any)._inflight,
            committed: true,
            action
          }]
        };
      } else if ((action as any)._inflight) {
        // Regular inflight actions should accumulate
        // until they are confirmed to be committed.
        return {
          ...state,
          _inflight: [...state._inflight, {
            id: (action as any)._inflight,
            committed: false,
            action
          }]
        };
      } else {
        return state;
      }
  }
  return state;
}

import {InflightCommitAction, InflightRejectAction} from '../actions/ActionTypes'
import Redux from 'redux'
import {AppStateWithHistory, AppState} from './StateTypes'

function stripState(state: AppStateWithHistory): AppStateWithHistory {
  const newState = {...state};
  delete newState._inflight;
  delete newState._committed;
  delete newState.settings;
  delete newState.remotePlay;
  return newState;
}

export function inflight(state: AppStateWithHistory, action: Redux.Action, combinedReduce: Redux.Reducer<any>): AppStateWithHistory {
  if (!state) {
    return;
  }
  if (state._inflight === undefined || state._committed === undefined) {
    // We store local (and remote) actions as in-flight until the oldest in-flight action's
    // transaction is either confirmed or rejected.
    // Thus, the current redux state (excluding _committed and _inflight)
    // is simply a derived view of the latest _committed with a combinedReduce() chain applied across all
    // in-flight actions.
    // TODO: How to handle actions with side effects?!?! Vibration & sound... Use a sideEffect() function wrapper?
    state._inflight = [];
    state._committed = stripState(state);
  }

  switch(action.type) {
    case 'REMOTE_PLAY_SESSION':
      // Initialize committed state
      return {...state, _committed: stripState(state)};
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
          _committed: stripState(state),
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
      for (let i = 0; i < state._inflight.length; i++) {
        if (state._inflight[i].id === id) {
          const newInflight = [...state._inflight];
          newInflight.splice(i, 1);
          return {
            ...state,
            _inflight: newInflight
          };
        }
      }
      console.error('Reject status received for unknown inflight action ' + (action as InflightCommitAction).id);
      break;
    case 'INFLIGHT_COMPACT':
      console.log('INFLIGHT COMPACT');
      // Run through inflight actions until encountering one that isn't committed. That's our new
      // committed state.
      let newCommitted = {...state._committed};
      for (let i = 0; i < state._inflight.length && state._inflight[i].committed; i++) {
        newCommitted = combinedReduce(newCommitted, state._inflight[i].action);
      }

      return {
        ...state,
        ...stripState(newCommitted),
        _committed: newCommitted,
        _inflight: [],
      };
    default:
      // Add all other actions to the inflight queue.
      if ((action as any)._inflight) {
        return {
          ...state,
          _inflight: [...state._inflight, {id: (action as any)._inflight, committed: false, action}]
        };
      } else {
        return state;
      }
  }
}

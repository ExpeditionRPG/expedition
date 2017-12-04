import {InflightCommitAction, InflightRejectAction} from '../actions/ActionTypes'
import Redux from 'redux'
import {AppStateWithHistory, AppState} from './StateTypes'

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
    state._committed = [];
  }

  switch(action.type) {
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
          _committed: state._history,
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
      console.log('got INFLIGHT_REJECT');
      for (let i = 0; i < state._inflight.length; i++) {
        if (state._inflight[i].id === (action as InflightRejectAction).id) {
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
      consecutiveCommits = 0;
      for (let i = 0; i < state._inflight.length && state._inflight[i].committed; i++) {
        consecutiveCommits++;
      }
      if (consecutiveCommits === state._inflight.length) {
        return {
          ...state,
          _inflight: [],
          _committed: state._history,
        } as AppStateWithHistory;
      } else {
        // Run through inflight actions until encountering one that isn't committed. That's our new
        // committed state.
        const newCommitted = [...state._committed];
        for (let i = 0; i < consecutiveCommits; i++) {
          newCommitted.push(combinedReduce(newCommitted[newCommitted.length-1], state._inflight[i].action));
        }
        return {
          ...state,
          _inflight: state._inflight.slice(consecutiveCommits),
          _committed: newCommitted,
          _return: false,
        };
      }
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

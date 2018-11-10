import * as Redux from 'redux';
import {ActionEvent} from 'shared/multiplayer/Events';
import {local, sendEvent, sendStatus} from '../actions/Multiplayer';
import {Connection} from './Connection';
import {counterAdd} from './Counters';

export function createMiddleware(conn: Connection): Redux.Middleware {
  return ({dispatch, getState}: Redux.MiddlewareAPI<any>) => (next: Redux.Dispatch<any>) => (action: any) => {
    const dispatchLocal = (a: Redux.Action) => dispatch(local(a));

    if (!action) {
      next(action);
      return;
    }

    let inflight: number = (action as any)._inflight;
    const localOnly = (action.type === 'LOCAL');

    if (localOnly) {
      // Unwrap local actions, passing through inflight data.
      action = action.action;
    }

    if (action && action.type) {
      switch (action.type) {
        case 'MULTIPLAYER_REJECT':
          counterAdd('failedTransactions', 1);
          break;
        case 'MULTIPLAYER_COMMIT':
          counterAdd('successfulTransactions', 1);
          break;
        case 'MULTIPLAYER_COMPACT':
          counterAdd('compactionEvents', 1);
          break;
        default:
          break;
      }
    }

    if (action instanceof Array) {
      const [name, fn, args] = action;
      const {commitID, multiplayer} = getState();
      if (multiplayer && multiplayer.connected && !localOnly && !inflight) {
        inflight = (conn.getMaxBufferID() || commitID) + 1;
      }

      // TODO: Handle txn mismatch when remoteArgs is null
      const remoteArgs = fn(args, (a: Redux.Action) => {
        // Assign an inflight transaction ID to be consumed by the inflight() reducer
        if (inflight) {
          (a as any)._inflight = inflight;
        }
        return dispatchLocal(a);
      }, getState);

      // Extract any promises made in the remotified function to allow for us to block to completion.
      const result = (remoteArgs !== null && remoteArgs !== undefined && remoteArgs.promise) ? remoteArgs.promise : null;

      if (remoteArgs !== null && remoteArgs !== undefined && !localOnly) {
        // Remove any promises made for completion tracking
        delete remoteArgs.promise;
        const argstr = JSON.stringify(remoteArgs);
        console.log('WS: outbound #' + inflight + ': ' + name + '(' + argstr + ')');
        dispatch(sendEvent({type: 'ACTION', name, args: argstr} as ActionEvent, commitID));
      }
      return result;
    } else if (typeof(action) === 'function') {
      if (inflight !== undefined) {
        return action((a: Redux.Action) => {
          (a as any)._inflight = inflight;
          return dispatchLocal(a);
        }, getState);
      } else {
        // Dispatch async actions
        return action(dispatchLocal, getState);
      }
    } else {
      // Pass through regular action objects
      next(action);
    }

    // MULTIPLAYER_COMPACT actions happen after inconsistent state is discovered
    // between the server and client and the client state has just been thrown out.
    // Send a status ping to the server to inform it of our new state.
    if (action.type === 'MULTIPLAYER_COMPACT') {
      dispatch(sendStatus());
    }
  };
}

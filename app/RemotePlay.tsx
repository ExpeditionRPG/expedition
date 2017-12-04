import Redux from 'redux'
import {RemotePlayEvent, ActionEvent, ClientID} from 'expedition-qdl/lib/remote/Events'
import {ClientBase} from 'expedition-qdl/lib/remote/Client'
import {local} from './actions/RemotePlay'
import {getStore} from './Store'
import * as Bluebird from 'bluebird'
import {remotePlaySettings} from './Constants'

const REMOTEPLAY_CLIENT_STATUS_POLL_MS = 5000;

// This is the base layer of the remote play network framework, implemented
// using firebase FireStore.
export class RemotePlayClient extends ClientBase {
  private session: WebSocket;
  private sessionClientIDs: string[];

  // Mirrors the committed counter on the websocket server.
  // Used to maintain a transactional event queue.
  private localEventCounter: number;

  connect(sessionID: string, clientID: string, secret: string): void {
    if (this.isConnected()) {
      this.disconnect();
    }
    this.sessionClientIDs = [this.id];
    this.localEventCounter = 0;

    this.session = new WebSocket(`${remotePlaySettings.websocketSession}/${sessionID}?client=${this.id}&instance=${this.instance}&secret=${secret}`);

    this.session.onmessage = (ev: MessageEvent) => {
      const parsed = JSON.parse(ev.data) as RemotePlayEvent;
      this.localEventCounter = parsed.id;
      this.handleMessage(parsed);
    };

    this.session.onerror = (ev: Event) => {
      console.error(ev);
    }
    this.session.onclose = () => {
      console.error('TODO RECONNECT');
    }
    this.session.onopen = () => {
      console.log('Open and ready to send');
      this.connected = true;
    }
  }

  disconnect() {
    this.session.close();
    this.connected = false;
  }

  sendFinalizedEvent(event: RemotePlayEvent): void {
    const start = Date.now();

    if (event.event.type === 'ACTION') {
      this.localEventCounter++;
      event.id = this.localEventCounter;
    }
    console.log(event);
    this.session.send(JSON.stringify(event));
  }

  public createActionMiddleware(): Redux.Middleware {
    return ({dispatch, getState}: Redux.MiddlewareAPI<any>) => (next: Redux.Dispatch<any>) => (action: any) => {
      const dispatchLocal = (a: Redux.Action) => {dispatch(local(a));};

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

      if (action instanceof Array) {
        const [name, fn, args] = action;
        if (this.isConnected() && !localOnly && !inflight) {
          inflight = this.localEventCounter+1;
        }

        // TODO: Handle txn mismatch when remoteArgs is null
        const remoteArgs = fn(args, (a: Redux.Action) => {
          // Assign an inflight transaction ID to be consumed by the inflight() reducer
          if (inflight) {
            (a as any)._inflight=inflight;
          }
          return dispatchLocal(a);
        }, getState);

        if (remoteArgs && !localOnly) {
          const argstr = JSON.stringify(remoteArgs);
          console.log('Outbound: ' + name + '(' + argstr + ') ' + inflight);
          this.sendEvent({type: 'ACTION', name, args: argstr} as ActionEvent);
        }
      } else if (typeof(action) === 'function') {
        if (inflight !== undefined) {
          action((a: Redux.Action) => {
            (a as any)._inflight = inflight;
            dispatchLocal(a);
          }, getState);
        } else {
          // Dispatch async actions
          action(dispatchLocal, getState);
        }
      } else {
        // Pass through regular action objects
        next(action);
      }
    }
  }
}

// TODO: Proper device ID
let client: RemotePlayClient = null;
export function getRemotePlayClient(): RemotePlayClient {
  if (client !== null) {
    return client
  }
  client = new RemotePlayClient();
  return client;
}

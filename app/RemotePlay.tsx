import Redux from 'redux'
import {RemotePlayEvent, ClientID} from 'expedition-qdl/lib/remote/Events'
import {ClientBase} from 'expedition-qdl/lib/remote/Client'
import {local} from './actions/RemotePlay'
import * as Bluebird from 'bluebird'

const REMOTEPLAY_CLIENT_STATUS_POLL_MS = 5000;

// The base layer of the remote play network framework. Key features:
// - handling of web socket connections
// - reconnect policy
// - Serializing "executable arrays" and broadcasting them
// - Unpacking and executing serialized actions locally
export class RemotePlayClient extends ClientBase {
  private websocketURI: string;
  private sock: WebSocket;
  private statusTimer: number;
  private actionSet: {[name: string]: any} = {};

  connect(websocketURI: string): Bluebird<{}> {
    return new Bluebird<{}>((resolve, reject) => {
      if (this.isConnected()) {
        this.disconnect();
      }
      this.websocketURI = websocketURI;
      this.sock = new WebSocket(this.websocketURI, 'expedition-remote-play-1.0');
      this.sock.onerror = (e: Event) => {
        this.handleMessage({client: this.id, event: {type: 'ERROR', error: 'Socket error: ' + e.toString()}});
      };
      this.sock.onmessage = (e: MessageEvent) => {
        this.handleMessage(JSON.parse(e.data));
      };

      let opened = false;
      this.sock.onclose = () => {
        // TODO: Attempt to reconnect with random exponential backoff.
        // This should be displayed to the user in some way.
        console.error('Socket closed');
        if (!opened) {
          reject('Socket closed');
        }
      };
      this.sock.onopen = () => {
        opened = true;
        // We periodically broadcast our status to other players so they
        // know we're connected and healthy.
        this.statusTimer = (setInterval(() => {
          if (!this.isConnected()) {
            clearInterval(this.statusTimer);
            console.log('Stopped sending status; socket not open');
          }
          this.sendEvent({type: 'STATUS', status: {line: 0, waiting: false}});
        }, REMOTEPLAY_CLIENT_STATUS_POLL_MS)) as any;

        resolve();
      }
    });
  }

  isConnected(): boolean {
    return (this.sock && this.sock.readyState === this.sock.OPEN);
  }

  disconnect() {
    this.sock.close();
  }

  sendEvent(e: any): void {
    if (!this.sock || this.sock.readyState !== this.sock.OPEN) {
      return;
    }
    const event: RemotePlayEvent = {client: this.id, event: e};
    this.sock.send(JSON.stringify(event));
  }

  public createActionMiddleware(): Redux.Middleware {
    return ({dispatch, getState}: Redux.MiddlewareAPI<any>) => (next: Redux.Dispatch<any>) => (action: any) => {
      const dispatchLocal = (a: Redux.Action) => {dispatch(local(a));};

      if (!action) {
        next(action);
        return;
      }

      const localOnly = (action.type === 'LOCAL');
      if (localOnly) {
        // Unwrap local actions
        action = action.action;
      }

      if (action instanceof Array) {
        const [name, fn, args] = action;
        const remoteArgs = fn(args, dispatchLocal, getState);
        if (remoteArgs && !localOnly) {
          const argstr = JSON.stringify(remoteArgs);
          console.log('Outbound: ' + name + '(' + argstr + ')');
          this.sendEvent({type: 'ACTION', name, args: argstr});
        }
      } else if (typeof(action) === 'function') {
        // Dispatch async actions
        action(dispatchLocal, getState);
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

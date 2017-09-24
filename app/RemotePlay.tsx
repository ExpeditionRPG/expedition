import Redux from 'redux'
import {RemotePlayEvent, ClientID} from 'expedition-qdl/lib/remote/Events'
import {ClientBase} from 'expedition-qdl/lib/remote/Client'
import {NavigateAction, RemotePlayAction} from './actions/ActionTypes'
import {local} from './actions/RemotePlay'
import * as Bluebird from 'bluebird'

const REMOTEPLAY_CLIENT_STATUS_POLL_MS = 5000;

// Returns a generator of an "executable array" of the original action.
// This array can be passed to the generated RemotePlay redux middleware
// which invokes it and packages it to send to other remote play clients.
export function remoteify<A>(a: (args: A, dispatch?: Redux.Dispatch<any>)=>any) {
  return (args: A) => {
    return ([a.name, a, args] as any) as Redux.Action; // We know better >:}
  }
}

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
          if (this.sock.readyState !== this.sock.OPEN) {
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
    return (this.sock.readyState === this.sock.OPEN);
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

  public registerModuleActions(module: any) {
    for (const e of Object.keys(module.exports)) {
      // Registered actions must be single-argument, named functions.
      if (typeof(module.exports[e]) !== 'function' || !module.exports[e].name || module.exports[e].length !== 2) {
        continue;
      }
      const f: (...args: any[])=>any = module.exports[e];
      this.actionSet[f.name] = f;
    }
  }

  public createActionMiddleware(): Redux.Middleware {
    return ({dispatch, getState}: Redux.MiddlewareAPI<any>) => (next: Redux.Dispatch<any>) => (action: any) => {
      if (!action) {
        next(action);
      } else if (action.type === 'REMOTE_PLAY_ACTION') {
        // If the action currently dispatched was dispatched from remote play,
        // let it pass through and don't broadcast it to other devices.

        if (action.action) {
          // Unwrap if action is object-like
          next((action as any as RemotePlayAction).action);
        } else {
          // Call function if action is function-like
          const fn = this.actionSet[action.name];
          if (!fn) {
            console.log('Failed to find registered action ' + action.name);
          }
          fn(action.args, (a: Redux.Action) => {dispatch(local(a));}, true);
        }
      } else if (action instanceof Array) {
        console.log('Dispatching array fn');
        console.log(action);
        const [name, fn, args] = action;
        const remoteArgs = fn(args, dispatch, (a: Redux.Action) => {dispatch(local(a));}, false);
        if (remoteArgs) {
          console.log('Sending remote event ' + name);
          this.sendEvent({type: 'ACTION', name, args: JSON.stringify(remoteArgs)});
        }
      } else if (typeof(action) === 'function') {
        // TODO: Remove this once redux-thunk based actions are converted to the new format.
        action(dispatch, getState);
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

import Redux from 'redux'
import {RemotePlayEvent, RemotePlayEventBody, ClientID} from 'expedition-qdl/lib/remote/Events'
import {ClientBase} from 'expedition-qdl/lib/remote/Client'
import {NavigateAction, RemotePlayAction} from './actions/ActionTypes'
import * as Bluebird from 'bluebird'

// The base layer of the remote play network framework; handles
// web socket connections & reconnect policy.
export class RemotePlayClient extends ClientBase {
  private websocketURI: string;
  private sock: WebSocket;
  private statusTimer: number;

  constructor(id: ClientID) {
    super(id);
  }

  setID(id: ClientID) {
    this.id = id;
  }

  // Connect asynchronously and reconnect as needed
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
        // TODO: REXP reconnect
        console.log('Socket closed');
        if (!opened) {
          reject('Socket closed');
        }
      };

      this.sock.onopen = () => {
        opened = true;
        this.statusTimer = (setInterval(() => {
          if (this.sock.readyState !== this.sock.OPEN) {
            clearInterval(this.statusTimer);
            console.log('Stopped sending status; socket not open');
          }
          this.sendEvent({type: 'STATUS', status: {line: 0, waiting: false}});
        }, 5000)) as any;

        resolve();
      }
    });
  }

  isConnected(): boolean {
    return false;
  }

  disconnect() {
    this.sock.close();
  }

  sendEvent(e: RemotePlayEventBody): void {
    if (!this.sock || this.sock.readyState !== this.sock.OPEN) {
      return;
    }
    const event: RemotePlayEvent = {client: this.id, event: e};
    this.sock.send(JSON.stringify(event));
    console.log('Sent ' + e.type);
  }

  public createActionMiddleware(): Redux.Middleware {
    return (api: Redux.MiddlewareAPI<any>) => (next: Redux.Dispatch<any>) => <A extends Redux.Action>(action: A) => {
      if (!action) {
        next(action);
        return;
      }

      // If the action currently dispatched was dispatched from remote play,
      // let it pass through and don't broadcast it to other devices.
      // TODO: Get this to handle multiple async dispatches, probably by reimplementing redux-thunk.
      let nextAction: Redux.Action;
      if (action.type === 'REMOTE_PLAY_ACTION') {
        next((action as any as RemotePlayAction).action);
        return;
      } else {
        nextAction = next(action);
      }

      if (!nextAction) {
        return;
      }

      switch(nextAction.type) {
        case 'NAVIGATE':
          const na = (nextAction as any as NavigateAction);
          if (na.to.name !== 'QUEST_CARD') {
            this.sendEvent({type: 'ACTION', action: JSON.stringify(na)});
          }
          break;
        case 'RETURN':
          this.sendEvent({type: 'ACTION', action: JSON.stringify(nextAction)});
          break;
        default:
          break;
      }
      return;
    }
  }
}

// TODO: Proper device ID
let client: RemotePlayClient = null;
export function getRemotePlayClient(): RemotePlayClient {
  if (client !== null) {
    return client
  }
  client = new RemotePlayClient('test');
  return client;
}

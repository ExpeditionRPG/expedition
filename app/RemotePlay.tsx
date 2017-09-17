import {RemotePlayEvent, RemotePlayEventBody, ClientID} from 'expedition-qdl/lib/remote/Events'
import {ClientBase} from 'expedition-qdl/lib/remote/Client'
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
      this.resetState();
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
          console.log('Sending status');
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
  }
}

// TODO: Proper device ID
export const client = new RemotePlayClient('test');

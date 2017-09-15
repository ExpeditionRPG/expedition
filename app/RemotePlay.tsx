import {RemotePlayEvent, ClientID} from 'expedition-qdl/lib/remote/Events'
import {ClientBase} from 'expedition-qdl/lib/remote/Client'

// The base layer of the remote play network framework; handles
// web socket connections & reconnect policy.
export class RemotePlayClient extends ClientBase {
  private websocketURI: string;
  private sock: WebSocket;

  constructor(id: ClientID) {
    super(id);
  }

  // Connect asynchronously and reconnect as needed
  connect(websocketURI: string) {
    if (this.isConnected()) {
      this.disconnect();
    }
    this.resetState();
    this.websocketURI = websocketURI;
    this.sock = new WebSocket(this.websocketURI, 'expedition-remote-play-1.0');

    this.sock.onerror = (e: Event) => {
      this.handleMessage({client: this.id, type: 'ERROR', error: 'Socket error: ' + e.toString()});
    };
    this.sock.onmessage = (e: MessageEvent) => {
      this.handleMessage(e.data);
    };
    this.sock.onclose = () => {
      // TODO: REXP reconnect
      console.log('Socket closed');
    };
  }

  isConnected(): boolean {
    return false;
  }

  disconnect() {
    this.sock.close();
  }

  sendEvent(e: RemotePlayEvent): void {
    this.sock.send(JSON.stringify(e));
  }
}

// TODO: Proper device ID
export const client = new RemotePlayClient('test');

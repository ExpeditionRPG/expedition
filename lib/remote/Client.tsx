import {RemotePlayEvent, RemotePlayEventBody, ClientID, InstanceID} from './Events'

declare type EventHandler = (e: RemotePlayEvent) => any;

// ClientBase is a remote play client that is designed to communicate with like peers.
export abstract class ClientBase {
  protected id: ClientID;
  protected instance: InstanceID;
  protected connected: boolean;
  private handlers: EventHandler[];

  constructor() {
    this.resetState();
  }

  isConnected(): boolean {
    return this.connected;
  }

  setID(id: ClientID) {
    this.id = id;
  }

  resetState() {
    this.handlers = [];
    this.connected = false;
  }

  abstract sendFinalizedEvent(e: RemotePlayEvent): void;
  abstract disconnect(): void;

  configure(id: string, instance: string): void {
    this.id = id;
    this.instance = instance;
  }

  sendEvent(event: RemotePlayEventBody): void {
    if (!this.isConnected()) {
      return;
    }
    // ID is set in sendFinalizedEvent
    this.sendFinalizedEvent({id: null, client: this.id, instance: this.instance, event});
  }

  protected handleMessage(e: RemotePlayEvent) {
    if (!e.event || !e.client || !e.instance) {
      this.publish({id: null, client: null, instance: null, event: {type: 'ERROR', error: 'Received malformed message'}});
      return;
    }

    // Error out if we get an unrecognized message
    if (['STATUS', 'INTERACTION', 'ACTION', 'ERROR', 'INFLIGHT_COMMIT', 'INFLIGHT_REJECT'].indexOf(e.event.type) < 0) {
      this.publish({id: null, client: null, instance: null, event: {type: 'ERROR', error: 'Received unknown message of type "' + e.event.type + '"'}});
      return;
    }

    this.publish(e);
  }

  publish(e: RemotePlayEvent) {
    for (const h of this.handlers) {
      h(e);
    }
  }

  subscribe(fn: EventHandler) {
    this.handlers.push(fn);
  }

  unsubscribe(fn: EventHandler) {
    const i = this.handlers.indexOf(fn);
    if(i > -1) {
      this.handlers.splice(i, 1);
    }
  }
}

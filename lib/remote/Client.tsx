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

  getID() {
    return this.id;
  }

  getInstance() {
    return this.instance;
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

  protected parseEvent(s: string): RemotePlayEvent {
    let parsed: RemotePlayEvent;

    try {
      parsed = JSON.parse(s) as RemotePlayEvent;
    } catch(e) {
      return {id: null, client: e.client, instance: e.instance, event: {type: 'ERROR', error: 'Failed to parse JSON message: ' + s}};
    }

    if (!parsed.event || !parsed.client || !parsed.instance) {
      return {id: null, client: parsed.client, instance: parsed.instance, event: {type: 'ERROR', error: 'Received malformed message: ' + s}};
    }

    if (['STATUS', 'INTERACTION', 'ACTION', 'MULTI_EVENT', 'ERROR', 'INFLIGHT_COMMIT', 'INFLIGHT_REJECT'].indexOf(parsed.event.type) < 0) {
      return {id: null, client: parsed.client, instance: parsed.instance, event: {type: 'ERROR', error: 'Received unknown message of type "' + parsed.event.type + '"'}};
    }

    return parsed;
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

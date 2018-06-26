import {ClientID, InstanceID, MultiplayerEvent, MultiplayerEventBody} from './Events';

declare type EventHandler = (e: MultiplayerEvent) => any;

// ClientBase is a multiplayer play client that is designed to communicate with like peers.
export abstract class ClientBase {
  protected id: ClientID;
  protected instance: InstanceID;
  protected connected: boolean;
  private handlers: EventHandler[];

  constructor() {
    this.resetState();
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public setID(id: ClientID) {
    this.id = id;
  }

  public getID() {
    return this.id;
  }

  public getInstance() {
    return this.instance;
  }

  public resetState() {
    this.handlers = [];
    this.connected = false;
  }

  public abstract sendFinalizedEvent(e: MultiplayerEvent): void;
  public abstract disconnect(): void;

  public configure(id: string, instance: string): void {
    this.id = id;
    this.instance = instance;
  }

  public sendEvent(event: MultiplayerEventBody): void {
    if (!this.isConnected()) {
      return;
    }
    // ID is set in sendFinalizedEvent
    this.sendFinalizedEvent({id: null, client: this.id, instance: this.instance, event});
  }

  protected parseEvent(s: string): MultiplayerEvent {
    let parsed: MultiplayerEvent;

    try {
      parsed = JSON.parse(s) as MultiplayerEvent;
    } catch (e) {
      return {
        client: e.client,
        event: {type: 'ERROR', error: 'Failed to parse JSON message: ' + s}
        id: null,
        instance: e.instance,
      };
    }

    if (!parsed.event || !parsed.client || !parsed.instance) {
      return {
        client: parsed.client,
        event: {type: 'ERROR', error: 'Received malformed message: ' + s}
        id: null,
        instance: parsed.instance,
      };
    }

    if (['STATUS', 'INTERACTION', 'ACTION', 'MULTI_EVENT', 'ERROR', 'INFLIGHT_COMMIT', 'INFLIGHT_REJECT']
      .indexOf(parsed.event.type) < 0) {
      return {
        client: parsed.client,
        event: {type: 'ERROR', error: 'Received unknown message of type "' + parsed.event.type + '"'}
        id: null,
        instance: parsed.instance,
      };
    }

    return parsed;
  }

  public publish(e: MultiplayerEvent) {
    for (const h of this.handlers) {
      h(e);
    }
  }

  public subscribe(fn: EventHandler) {
    this.handlers.push(fn);
  }

  public unsubscribe(fn: EventHandler) {
    const i = this.handlers.indexOf(fn);
    if (i > -1) {
      this.handlers.splice(i, 1);
    }
  }
}

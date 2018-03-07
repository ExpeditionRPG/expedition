import Redux from 'redux'
import {getRemoteAction} from './actions/ActionTypes'
import {RemotePlayEvent, RemotePlayEventBody, ActionEvent, StatusEvent, ClientID} from 'expedition-qdl/lib/remote/Events'
import {ClientBase} from 'expedition-qdl/lib/remote/Client'
import {toClientKey} from 'expedition-qdl/lib/remote/Session'
import {local} from './actions/RemotePlay'
import {getStore} from './Store'
import * as Bluebird from 'bluebird'
import {remotePlaySettings} from './Constants'

const REMOTEPLAY_CLIENT_STATUS_POLL_MS = 5000;
const CONNECTION_LOOP_MS = 200;
const RETRY_DELAY_MS = 2000;
const STATUS_MS = 5000;
const MAX_RETRIES = 2;

// Max reconnect time is slot_time * 2^(slot_idx) + base = 10440 ms
const RECONNECT_MAX_SLOT_IDX = 10;
const RECONNECT_SLOT_DELAY_MS = 10;
const RECONNECT_DELAY_BASE_MS = 200;

export interface RemotePlayCounters {
  [field: string]: number;

  sessionCount: number,
  disconnectCount: number,
  reconnectCount: number,
  compactionEvents: number,
  receivedEvents: number,
  errorEvents: number,
  failedTransactions: number,
  successfulTransactions: number,
}

export const initialRemotePlayCounters = {
  sessionCount: 0,
  disconnectCount: 0,
  reconnectCount: 0,
  compactionEvents: 0,
  receivedEvents: 0,
  errorEvents: 0,
  successfulTransactions: 0,
  failedTransactions: 0,
};


function hasUncommittedInFlight(id: number): boolean {
  const inflight = getStore().getState()._inflight;
  const filtered = (inflight || []).filter((i) => {return i.id === id;});
  return (filtered.length > 0 && !filtered[0].committed);
}

function isSyncing(): boolean {
  return getStore().getState().remotePlay.syncing;
}

// This is the base layer of the remote play network framework, implemented
// using firebase FireStore.
export class RemotePlayClient extends ClientBase {
  private session: WebSocket;
  private sessionClientIDs: string[];
  private reconnectAttempts: number;
  private sessionID: string;
  private secret: string;
  private stats: RemotePlayCounters;
  private messageBuffer: {id: number, msg: string, retries: number, ts: number}[]
  private lastStatusMs: number;

  // Mirrors the committed counter on the websocket server.
  // Used to maintain a transactional event queue.
  private committedEventCounter: number;

  // Counter used for sending new events (we can have multiple in-flight).
  private localEventCounter: number;


  constructor() {
    super();
    this.resetState();
    setInterval(() => {this.connectionLoop();}, CONNECTION_LOOP_MS);
  }

  resetState() {
    super.resetState();
    this.localEventCounter = 0;
    this.committedEventCounter = 0;
    this.messageBuffer = [];
    this.reconnectAttempts = 0;
    this.lastStatusMs = 0;
    this.stats = {...initialRemotePlayCounters};
  }

  private connectionLoop() {
    if (!this.isConnected()) {
      return;
    }
    // Retransmit messages that have been ignored for too long.
    const now = Date.now();
    for (let i = 0; i < this.messageBuffer.length; i++) {
      const b = this.messageBuffer[i];
      if (now - b.ts > RETRY_DELAY_MS) {
        if (b.retries >= MAX_RETRIES) {
          // Publish a local rejection if the server hasn't seen the message after many retries.
          this.messageBuffer.splice(i, 1);
          this.handleEvent({
            id: b.id,
            client: this.id,
            instance: this.instance,
            event: {
              type: 'INFLIGHT_REJECT',
              id: b.id,
              error: 'Too many retries',
              conflicts: null,
            },
          });
          console.warn('Failed to get response for msg ' + b.id);
        } else {
          this.session.send(b.msg);
          b.retries++;
          b.ts = now;
          console.warn('Retrying msg ' + b.id);
        }
      }
    }
    
    // We send a periodic status to the server to keep it advised 
    // of our connection and event ID state.
    if (now - this.lastStatusMs > STATUS_MS) {
      this.sendStatus();
      this.lastStatusMs = now;
    }
  }

  handleEvent(e: RemotePlayEvent) {
    // Update stats
    this.stats.receivedEvents++;
    if (e.event.type === 'ERROR') {
      this.stats.errorEvents++;
    }

    // Remove message from the retry buffer if an event of a similar ID is mentioned
    // by the server.
    if (e.id !== null) {
      for (let i = 0; i < this.messageBuffer.length; i++) {
        if (e.id === this.messageBuffer[i].id) {
          this.messageBuffer.splice(i, 1);
          i--;
        }
      }
    }

    if (e.id && e.id !== (this.committedEventCounter + 1)) {
      // We should ignore actions that we don't expect, and instead let the server
      // know we're behind so we can fast-forward appropriately.
      // Note that MULTI_EVENTs have no top-level ID and aren't affected by this check.
      console.log('Ignoring #' + e.id + ' ' + e.event.type + ' (counter at #' + this.committedEventCounter + ')');
      this.sendStatus();
      return;
    }

    this.routeEvent(e, getStore().dispatch);
  }

  routeEvent(e: RemotePlayEvent, dispatch: Redux.Dispatch<any>) {
    switch (e.event.type) {
      case 'INFLIGHT_COMMIT':
        if (e.id === null || !hasUncommittedInFlight(e.id)) {
          this.sendStatus();
          return;
        }

        dispatch({type: 'INFLIGHT_COMMIT', id: e.id});
        this.committedEvent(e.id);
        break;
      case 'INFLIGHT_REJECT':
        if (e.id === null || !hasUncommittedInFlight(e.id)) {
          this.sendStatus();
          return;
        }
        dispatch({
          type: 'INFLIGHT_REJECT',
          id: e.id,
          error: e.event.error,
        });
        this.rejectedEvent(e.id);
        if (e.event.conflicts !== null) {
          // Typically, INFLIGHT_REJECT comes with a list of events that conflict
          // with the inflight event. We treat these as if they were an independent
          // MULTI_EVENT so we can catch up in state.
          this.routeEvent({
            id: e.id,
            client: e.client,
            instance: e.instance,
            event: e.event.conflicts
          }, dispatch);
        }
        break;
      case 'STATUS':
        dispatch({
          type: 'REMOTE_PLAY_CLIENT_STATUS',
          client: e.client,
          instance: e.instance,
          status: e.event
        });
        break;
      case 'INTERACTION':
        // Interaction events are not dispatched; UI element subscribers pick up the event on publish().
        break;
      case 'ACTION':
        // Actions must have IDs.
        if (e.id === null) {
          return;
        }

        // We must be ready to receive the action (it will get retransmitted otherwise)
        if (isSyncing()) {
          console.warn('Ignoring #' + e.id + ' (syncing)');
          return;
        }

        // If the server is describing an event and we have a similar ID in-flight,
        // cancel the in-flight event in favor of the server's opinion.
        // This can happen in edge cases, e.g. client sends event A, connection flaps,
        // server responds to client status with MULTI_ACTION on event A.
        if (hasUncommittedInFlight(e.id)) {
          dispatch({
            type: 'INFLIGHT_REJECT',
            id: e.id,
            error: 'Received remote ACTION with matching id',
          });
          this.rejectedEvent(e.id);
          return;
        }

        const a = getRemoteAction(e.event.name);
        if (!a) {
          console.error('Received unknown remote action ' + e.event.name);
          return;
        } else {
          console.log('WS: Inbound #' + e.id + ': ' + e.event.name + '(' + e.event.args + ')');

          // Set a "remote" inflight marker so it's identifiable
          // when debugging.
          const action = a(JSON.parse(e.event.args));
          (action as any)._inflight = 'remote';

          dispatch(local(action));

          if (e.id !== null) {
            this.committedEvent(e.id);
          }
        }
        break;
      case 'MULTI_EVENT':
        // We must be ready to receive the actions (they will get retransmitted otherwise)
        if (isSyncing()) {
          console.warn('Ignoring #' + e.id + ' (syncing)');
          return;
        }

        for (let i = 0; i < e.event.events.length; i++) {
          let parsed: RemotePlayEvent;
          try {
            parsed = JSON.parse(e.event.events[i]);
            if (!parsed.id) {
              throw new Error('MULTI_EVENT without ID: ' + parsed);
            }
          } catch(e) {
            console.error(e);
            continue;
          }

          // Reject the whole event it does not contain events that we need.
          if (i === 0 && parsed.id && parsed.id > this.committedEventCounter + 1) {
            console.error('Ignoring MULTI_EVENT starting with #' + parsed.id + ' when counter is #' + this.committedEventCounter);
            return;
          }

          // Ignore if it contains events earlier than our committed event counter.
          if (parsed.id !== null && parsed.id <= this.committedEventCounter) {
            continue;
          }

          // Defer to the server if it knows about an event that we currently think is in-flight.
          if (parsed.id !== null && hasUncommittedInFlight(parsed.id)) {
            dispatch({
              type: 'INFLIGHT_REJECT',
              id: parsed.id,
              error: 'Received remote ACTION with matching id',
            });
            this.rejectedEvent(parsed.id);
            return;
          }

          this.routeEvent(parsed, dispatch);
        }
        this.committedEvent(e.event.lastId);
        break;
      case 'ERROR':
        console.error(JSON.stringify(e.event));
        break;
      default:
        console.error('UNKNOWN EVENT ' + (e.event as any).type);
    }

    this.publish(e);
  }

  // When transactions are committed/rejected, we may need to to amend the
  // counter to get back on track.
  committedEvent(n: number) {
    this.localEventCounter = Math.max(this.localEventCounter, n);
    this.committedEventCounter = Math.max(this.committedEventCounter, n);
  }
  rejectedEvent(n: number) {
    this.localEventCounter = Math.min(this.localEventCounter, Math.max(this.committedEventCounter, n-1));
  }

  getStats(): RemotePlayCounters {
    return this.stats;
  }

  sendStatus(partialStatus?: StatusEvent): void {
    const state = getStore().getState();
    const elem = (state.quest && state.quest.node && state.quest.node.elem);
    const selfStatus = (state.remotePlay && state.remotePlay.clientStatus && state.remotePlay.clientStatus[this.id]);
    let event: StatusEvent = {
      type: 'STATUS',
      connected: true,
      numPlayers: (state.settings && state.settings.numPlayers) || 1,
      line: (elem && parseInt(elem.attr('data-line'), 10)),
      lastEventID: this.committedEventCounter,
      waitingOn: (selfStatus && selfStatus.waitingOn),
    };
    if (partialStatus) {
      event = {...event, ...partialStatus};
    }

    // Send remote and also publish locally
    this.sendEvent(event);
    this.publish({
      id: null,
      client: this.id,
      instance: this.instance,
      event,
    });
  }

  getClientKey(): string {
    return toClientKey(this.id, this.instance);
  }

  reconnect() {
    if (this.session) {
      this.session.close();
    }
    this.stats.reconnectCount++;

    // Random exponential backoff reconnect
    // https://en.wikipedia.org/wiki/Exponential_backoff
    const slot_idx = Math.floor(Math.random() * (this.reconnectAttempts+1))
    const slot = Math.pow(2,slot_idx);
    const delay = RECONNECT_SLOT_DELAY_MS * slot + RECONNECT_DELAY_BASE_MS;
    console.log(`WS: Waiting to reconnect (${delay} ms)`);
    setTimeout(() => {
      console.log('WS: reconnecting...');
      this.connect(this.sessionID, this.secret);
    }, delay);
    this.reconnectAttempts = Math.min(this.reconnectAttempts + 1, RECONNECT_MAX_SLOT_IDX);
  }

  connect(sessionID: string, secret: string): void {
    // Save these for reconnect
    this.sessionID = sessionID;
    this.secret = secret;

    if (this.isConnected()) {
      this.disconnect();
    }
    this.sessionClientIDs = [this.id];

    this.session = new WebSocket(`${remotePlaySettings.websocketSession}/${sessionID}?client=${this.id}&instance=${this.instance}&secret=${secret}`);

    this.session.onmessage = (ev: MessageEvent) => {
      this.handleEvent(this.parseEvent(ev.data));
    };

    this.session.onerror = (ev: ErrorEvent) => {
      console.error(ev);
    };

    this.session.onclose = (ev: CloseEvent) => {
      this.stats.disconnectCount++;

      switch (ev.code) {
        case 1000:  // CLOSE_NORMAL
          if (this.connected === false) {
            console.log('WS: closed normally');
          } else {
            console.warn('WS: closed by server');
            this.reconnect();
          }
          break;
        default:  // Abnormal closure
          console.error('WS: abnormal closure');
          this.reconnect();
          break;
      }

      // Notify local listeners that we've disconnected
      this.publish({
        id: null,
        client: this.id,
        instance: this.instance,
        event: {
          type: 'STATUS',
          connected: false,
        },
      });
    };

    this.session.onopen = () => {
      this.stats.sessionCount++;
      console.log('WS: open');
      this.connected = true;
      this.sendStatus();
    }
  }

  disconnect() {
    this.connected = false;
    this.session.close();
    this.stats.disconnectCount++;
  }

  sendFinalizedEvent(event: RemotePlayEvent): void {
    const start = Date.now();

    if (event.event.type === 'ACTION') {
      this.localEventCounter++;
      event.id = this.localEventCounter;
    }
    const msg = JSON.stringify(event);
    this.session.send(msg);
    if (event.id !== null) {
      // If the event is transactional, push it onto the messageBuffer
      // so we can retry sending it if needed.
      this.messageBuffer.push({id: event.id, msg, retries: 0, ts: Date.now()});
    }
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

      if (action && action.type) {
        switch (action.type) {
          case 'INFLIGHT_REJECT':
            this.stats.failedTransactions++;
            break;
          case 'INFLIGHT_COMMIT':
            this.stats.successfulTransactions++;
            break;
          case 'INFLIGHT_COMPACT':
            this.stats.compactionEvents++;
            break;
          default:
            break;
        }
      }

      if (action instanceof Array) {
        const [name, fn, args] = action;
        if (this.isConnected() && !localOnly && !inflight) {
          inflight = this.localEventCounter + 1;
        }

        // TODO: Handle txn mismatch when remoteArgs is null
        const remoteArgs = fn(args, (a: Redux.Action) => {
          // Assign an inflight transaction ID to be consumed by the inflight() reducer
          if (inflight) {
            (a as any)._inflight = inflight;
          }
          return dispatchLocal(a);
        }, getState);

        if (remoteArgs !== null && remoteArgs !== undefined && !localOnly) {
          const argstr = JSON.stringify(remoteArgs);
          console.log('WS: outbound #' + inflight + ': ' + name + '(' + argstr + ')');
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


      // INFLIGHT_COMPACT actions happen after inconsistent state is discovered
      // between the server and client and the client state has just been thrown out.
      // Send a status ping to the server to inform it of our new state.
      if (action.type === 'INFLIGHT_COMPACT') {
        this.sendStatus();
      }
    }
  }
}

// TODO: Proper device ID
let client: RemotePlayClient|null = null;
export function getRemotePlayClient(): RemotePlayClient {
  if (client !== null) {
    return client
  }
  client = new RemotePlayClient();
  return client;
}


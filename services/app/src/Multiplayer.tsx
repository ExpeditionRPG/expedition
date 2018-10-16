import Redux from 'redux';
import {ClientBase} from 'shared/multiplayer/Client';
import {ActionEvent, MultiplayerEvent, StatusEvent} from 'shared/multiplayer/Events';
import {toClientKey} from 'shared/multiplayer/Session';
import {getMultiplayerAction, MultiplayerMultiEventStartAction} from './actions/ActionTypes';
import {local} from './actions/Multiplayer';
import {MULTIPLAYER_SETTINGS} from './Constants';
import {getStore} from './Store';

const CONNECTION_LOOP_MS = 200;
const RETRY_DELAY_MS = 2000;
const STATUS_MS = 5000;
const MAX_RETRIES = 2;

// Max reconnect time is slot_time * 2^(slotIdx) + base = 10440 ms
const RECONNECT_MAX_SLOT_IDX = 10;
const RECONNECT_SLOT_DELAY_MS = 10;
const RECONNECT_DELAY_BASE_MS = 200;

export interface MultiplayerCounters {
  [field: string]: number;
  compactionEvents: number;
  disconnectCount: number;
  errorEvents: number;
  failedTransactions: number;
  receivedEvents: number;
  reconnectCount: number;
  sessionCount: number;
  successfulTransactions: number;
  syncs: number;
}

export const initialMultiplayerCounters = {
  compactionEvents: 0,
  disconnectCount: 0,
  errorEvents: 0,
  failedTransactions: 0,
  receivedEvents: 0,
  reconnectCount: 0,
  sessionCount: 0,
  successfulTransactions: 0,
  syncs: 0,
};

function getCommitID(): number {
  return getStore().getState().commitID;
}

// This is the base layer of the multiplayer network framework
export class MultiplayerClient extends ClientBase {
  private session: WebSocket;
  private reconnectAttempts: number;
  private sessionID: string;
  private secret: string;
  private stats: MultiplayerCounters;
  private messageBuffer: Array<{id: number, msg: string, retries: number, ts: number}>;
  private lastStatusMs: number;

  // Counter used for sending new events (we can have multiple in-flight).
  private localEventCounter: number;

  constructor() {
    super();
    this.resetState();
    setInterval(() => {this.connectionLoop(); }, CONNECTION_LOOP_MS);
  }

  public sync() {
    this.localEventCounter = 0;
    this.messageBuffer = [];
    this.reconnectAttempts = 0;
    this.lastStatusMs = 0;
    this.stats.syncs++;
    this.sendStatus();
  }

  public resetState() {
    super.resetState();
    this.localEventCounter = 0;
    this.messageBuffer = [];
    this.reconnectAttempts = 0;
    this.lastStatusMs = 0;
    this.stats = {...initialMultiplayerCounters};
  }

  public hasInFlight(id: number): boolean {
    const filtered = this.messageBuffer.filter((b) => b.id === id);
    return (filtered.length > 0);
  }

  public getInFlightAtOrBelow(id: number): number[] {
    return this.messageBuffer.filter((b) => {
      return (b.id <= id);
    }).map((b) => {
      return b.id;
    });
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
          this.rejectedEvent(b.id, 'Too many retries');
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
    }
  }

  public removeFromQueue(id: number) {
    for (let i = 0; i < this.messageBuffer.length; i++) {
      if (id === this.messageBuffer[i].id) {
        this.messageBuffer.splice(i, 1);
        i--;
      }
    }
  }

  public routeEvent(e: MultiplayerEvent, dispatch: Redux.Dispatch<any>) {
    // Update stats
    this.stats.receivedEvents++;
    if (e.event.type === 'ERROR') {
      this.stats.errorEvents++;
    }

    const committedEventCounter = getCommitID();
    if (e.id && e.id !== (committedEventCounter + 1)) {
      // We should ignore actions that we don't expect, and instead let the server
      // know we're behind so we can fast-forward appropriately.
      // Note that MULTI_EVENTs have no top-level ID and aren't affected by this check.
      console.log('Ignoring #' + e.id + ' ' + e.event.type + ' (counter at #' + committedEventCounter + ')');
      this.sendStatus();
      return;
    }

    console.log(e);
    const body = e.event;
    switch (body.type) {
      case 'STATUS':
        dispatch({
          client: e.client,
          instance: e.instance,
          status: body,
          type: 'MULTIPLAYER_CLIENT_STATUS',
        });
        break;
      case 'INTERACTION':
        // Interaction events are not dispatched; UI element subscribers pick up the event on publish().
        break;
      case 'ACTION':
        // Actions must have IDs.
        if (e.id === null) {
          console.log('Inflight null id', e);
          return;
        }

        // If the server is describing an event and we have a similar ID in-flight,
        // cancel the in-flight event in favor of the server's opinion.
        // This can happen in edge cases, e.g. client sends event A, connection flaps,
        // server responds to client status with MULTI_ACTION on event A.
        if (this.hasInFlight(e.id)) {
          console.log('Received inflight ' + e.id);
          this.removeFromQueue(e.id);

          // If the event came from us, commit it. Otherwise, reject the
          // local in-flight event.
          if (e.client === this.id && e.instance === this.instance) {
            this.committedEvent(e.id);
          } else {
            this.rejectedEvent(e.id, 'Multiplayer ACTION matching inflight');
          }
          return;
        }

        const a = getMultiplayerAction(body.name);
        if (!a) {
          console.error('Received unknown remote action ' + body.name);
          return;
        }

        console.log('WS: Inbound #' + e.id + ': ' + body.name + '(' + body.args + ')');
        // Set a "remote" inflight marker so it's identifiable
        // when debugging.
        const action = a(JSON.parse(body.args));
        (action as any)._inflight = 'remote';

        let result: any;
        try {
          console.log('dispatched');
          result = dispatch(local(action));
        } finally {
          if (e.id !== null) {
            this.removeFromQueue(e.id);
            this.committedEvent(e.id);
            console.log('marked commit');
          }
        }
        return result;
      case 'MULTI_EVENT':
        let chain = Promise.resolve().then(() => {
          dispatch(local({type: 'MULTIPLAYER_MULTI_EVENT_START', syncID: body.lastId} as MultiplayerMultiEventStartAction));
        });
        for (const event of body.events) {
          let parsed: MultiplayerEvent;
          try {
            parsed = JSON.parse(event);
            if (!parsed.id) {
              throw new Error('MULTI_EVENT without ID: ' + parsed);
            }
          } catch (e) {
            console.error(e);
            continue;
          }

          // Sometimes we need to handle async actions - e.g. when calls to dispatch() return a promise in the inner routeEvent().
          // This constructs a chain of promises out of the calls to MULTI_EVENT so that async actions like fetchQuestXML are
          // allowed to complete before the next action is processed.
          // Actions are dispatched within a timeout so that react UI updates aren't blocked by
          // event routing.
          chain = chain.then((_: any) => {
            console.log('routing ' + parsed.id);
            return new Promise<void>((fulfill, reject) => {
              setTimeout(() => {
                const route: any = this.routeEvent(parsed, dispatch);
                if (route && typeof(route) === 'object' && route.then) {
                  console.log('Chaining promise from event: ', parsed);
                  return route;
                }
                fulfill();
              }, 0);
            });
          });
        }

        chain = chain.then((_: any) => {
          dispatch(local({type: 'MULTIPLAYER_MULTI_EVENT'}));
        });
        break;
      case 'ERROR':
        console.error(JSON.stringify(body));
        break;
      default:
        console.error('UNKNOWN EVENT ' + (body as any).type);
        if (e.id) {
          this.committedEvent(e.id);
        }
    }

    this.publish(e);
  }

  // When transactions are committed/rejected, we may need to to amend the
  // counter to get back on track.
  public committedEvent(n: number) {
    console.log('MULTIPLAYER_COMMIT #' + n);
    this.localEventCounter = Math.max(this.localEventCounter, n);
    getStore().dispatch({type: 'MULTIPLAYER_COMMIT', id: n});
  }

  public rejectedEvent(n: number, error: string) {
    console.log('MULTIPLAYER_REJECT #' + n + ': ' + error);
    this.localEventCounter = Math.min(this.localEventCounter, Math.max(getCommitID(), n - 1));
    getStore().dispatch({
      error,
      id: n,
      type: 'MULTIPLAYER_REJECT',
    });
  }

  public getStats(): MultiplayerCounters {
    return this.stats;
  }

  public sendStatus(partialStatus?: StatusEvent): void {
    const now = Date.now();
    // Debounce status (don't send too often)
    if (now - this.lastStatusMs < STATUS_MS / 5) {
      return;
    }

    const store = getStore();
    const state = store.getState();
    const elem = (state.quest && state.quest.node && state.quest.node.elem);
    const selfStatus = (state.multiplayer && state.multiplayer.clientStatus && state.multiplayer.clientStatus[this.getClientKey()]);
    console.log(state.commitID);
    let event: StatusEvent = {
      connected: true,
      lastEventID: state.commitID,
      line: (elem && parseInt(elem.attr('data-line'), 10)),
      numPlayers: (state.settings && state.settings.numPlayers) || 1,
      type: 'STATUS',
      waitingOn: (selfStatus && selfStatus.waitingOn),
    };
    if (partialStatus) {
      event = {...event, ...partialStatus};
    }

    // Send remote and also publish locally
    this.sendEvent(event);
    store.dispatch({
      client: this.id,
      instance: this.instance,
      status: event,
      type: 'MULTIPLAYER_CLIENT_STATUS',
    });
    this.publish({
      client: this.id,
      event,
      id: null,
      instance: this.instance,
    });

    this.lastStatusMs = now;
  }

  public getClientKey(): string {
    return toClientKey(this.id, this.instance);
  }

  public reconnect() {
    if (this.session) {
      this.session.close();
    }
    this.stats.reconnectCount++;

    // Random exponential backoff reconnect
    // https://en.wikipedia.org/wiki/Exponential_backoff
    const slotIdx = Math.floor(Math.random() * (this.reconnectAttempts + 1));
    const slot = Math.pow(2, slotIdx);
    const delay = RECONNECT_SLOT_DELAY_MS * slot + RECONNECT_DELAY_BASE_MS;
    console.log(`WS: Waiting to reconnect (${delay} ms)`);
    setTimeout(() => {
      console.log('WS: reconnecting...');
      this.connect(this.sessionID, this.secret);
    }, delay);
    this.reconnectAttempts = Math.min(this.reconnectAttempts + 1, RECONNECT_MAX_SLOT_IDX);
  }

  public connect(sessionID: string, secret: string): void {
    // Save these for reconnect
    this.sessionID = sessionID;
    this.secret = secret;

    if (this.isConnected()) {
      this.disconnect();
    }

    this.session = new WebSocket(`${MULTIPLAYER_SETTINGS.websocketSession}/${sessionID}?client=${this.id}&instance=${this.instance}&secret=${secret}`);

    this.session.onmessage = (ev: MessageEvent) => {
      this.routeEvent(this.parseEvent(ev.data), getStore().dispatch);
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
        client: this.id,
        event: {
          connected: false,
          type: 'STATUS',
        },
        id: null,
        instance: this.instance,
      });
    };

    this.session.onopen = () => {
      this.stats.sessionCount++;
      console.log('WS: open');
      this.connected = true;
      this.sendStatus();
    };
  }

  public disconnect() {
    this.connected = false;
    this.session.close(1000);
  }

  public sendFinalizedEvent(event: MultiplayerEvent): void {
    if (event.event.type === 'ACTION') {
      this.localEventCounter++;
      event.id = this.localEventCounter;
    }
    const msg = JSON.stringify(event);
    try {
      this.session.send(msg);
    } catch (e) {
      // Don't treat transmission errors as a hard error,
      // but do log them to the console.
      // If they need to be retried, they will be.
      console.error(e);
    }

    if (event.id !== null) {
      // If the event is transactional, push it onto the messageBuffer
      // so we can retry sending it if needed.
      this.messageBuffer.push({id: event.id, msg, retries: 0, ts: Date.now()});
    }
  }

  public createActionMiddleware(): Redux.Middleware {
    return ({dispatch, getState}: Redux.MiddlewareAPI<any>) => (next: Redux.Dispatch<any>) => (action: any) => {
      const dispatchLocal = (a: Redux.Action) => dispatch(local(a));

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
          case 'MULTIPLAYER_REJECT':
            this.stats.failedTransactions++;
            break;
          case 'MULTIPLAYER_COMMIT':
            this.stats.successfulTransactions++;
            break;
          case 'MULTIPLAYER_COMPACT':
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

        // Extract any promises made in the remotified function to allow for us to block to completion.
        const result = (remoteArgs !== null && remoteArgs !== undefined && remoteArgs.promise) ? remoteArgs.promise : null;

        if (remoteArgs !== null && remoteArgs !== undefined && !localOnly) {
          // Remove any promises made for completion tracking
          delete remoteArgs.promise;
          const argstr = JSON.stringify(remoteArgs);
          console.log('WS: outbound #' + inflight + ': ' + name + '(' + argstr + ')');
          this.sendEvent({type: 'ACTION', name, args: argstr} as ActionEvent);
        }
        return result;
      } else if (typeof(action) === 'function') {
        if (inflight !== undefined) {
          return action((a: Redux.Action) => {
            (a as any)._inflight = inflight;
            return dispatchLocal(a);
          }, getState);
        } else {
          // Dispatch async actions
          return action(dispatchLocal, getState);
        }
      } else {
        // Pass through regular action objects
        next(action);
      }

      // MULTIPLAYER_COMPACT actions happen after inconsistent state is discovered
      // between the server and client and the client state has just been thrown out.
      // Send a status ping to the server to inform it of our new state.
      if (action.type === 'MULTIPLAYER_COMPACT') {
        this.sendStatus();
      }
    };
  }
}

// TODO: Proper device ID
let client: MultiplayerClient|null = null;
export function getMultiplayerClient(): MultiplayerClient {
  if (client !== null) {
    return client;
  }
  client = new MultiplayerClient();
  return client;
}

import {ClientBase} from 'shared/multiplayer/Client';
import {MultiplayerEvent, MultiplayerEventBody, StatusEvent} from 'shared/multiplayer/Events';
import {MULTIPLAYER_SETTINGS} from '../Constants';
import {getOnlineState} from '../Globals';
import {counterAdd, resetCounters} from './Counters';

const CONNECTION_LOOP_MS = 200;
const CONNECTION_CHECK_MS = 5000;
const RETRY_DELAY_MS = 2000;
const MAX_RETRIES = 2;

// Max reconnect time is slot_time * 2^(slotIdx) + base = 10440 ms
const RECONNECT_MAX_SLOT_IDX = 10;
const RECONNECT_SLOT_DELAY_MS = 10;
const RECONNECT_DELAY_BASE_MS = 200;

export interface ConnectionHandler {
  onConnectionChange: (connected: boolean) => void;
  onReject: (n: number, error: string) => void;
  onEvent: (e: MultiplayerEvent, buffered: boolean) => void;
}

// This is the base layer of the multiplayer network framework
export class Connection extends ClientBase {
  private handler: ConnectionHandler;

  // TODO(scott): Lock this down after migrating action/combat code
  public sendStatus: (partialStatus?: StatusEvent) => void;

  private session: WebSocket;
  private reconnectAttempts: number;
  private sessionID: string;
  private secret: string;
  private messageBuffer: Array<{id: number, msg: string, retries: number, ts: number}>;

  private getOnlineState: () => Promise<boolean>;

  constructor(onlineState = getOnlineState) {
    super();
    this.resetState();
    this.getOnlineState = onlineState;
    this.sessionID = '';
    this.secret = '';
    setInterval(() => {this.connectionLoop(); }, CONNECTION_LOOP_MS);

    // TODO only enable if not embedded within quests interface
    console.error('Skipping connection check, usually every ms', CONNECTION_CHECK_MS);
    //  setInterval(() => {this.checkOnlineState(); }, CONNECTION_CHECK_MS);
  }

  public checkOnlineState(): Promise<void> {
    return this.getOnlineState().then((isOnline) => {
      if (!this.sessionID && this.isConnected()) {
        // If we recently disconnected (i.e. sessionID is "")
        // then our connection check shouldn't indicate the
        // multiplayer link is live, regardless of connectivity.
        this.connected = false;
      } else if (this.sessionID && this.isConnected() !== isOnline) {
        this.connected = isOnline;
      } else {
        return;
      }
      console.warn('online state changed to', isOnline);
      this.handler.onConnectionChange(this.connected);
    });
  }

  public registerHandler(handler: ConnectionHandler) {
    this.handler = handler;
  }

  public sync() {
    this.messageBuffer = [];
    this.reconnectAttempts = 0;
    counterAdd('syncs', 1);
  }

  public resetState() {
    super.resetState();
    this.messageBuffer = [];
    this.reconnectAttempts = 0;
    this.sessionID = '';
    this.secret = '';

    resetCounters();
  }

  public getMaxBufferID(): number|null {
    if (this.messageBuffer.length === 0) {
      return null;
    }
    return this.messageBuffer.reduce((accum, curr) => Math.max(accum, curr.id), 0);
  }

  public bufferedAtOrbelow(id: number): boolean {
    return (this.messageBuffer.filter((b) => {
      return (b.id <= id);
    }).map((b) => {
      return b.id;
    })).length > 0;
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
          this.handler.onReject(b.id, 'Too many retries');
        } else {
          this.session.send(b.msg);
          b.retries++;
          b.ts = now;
          console.warn('Retrying msg ' + b.id);
        }
      }
    }
  }

  private removeFromQueue(id: number) {
    for (let i = 0; i < this.messageBuffer.length; i++) {
      if (id === this.messageBuffer[i].id) {
        this.messageBuffer.splice(i, 1);
        i--;
      }
    }
  }

  public reconnect() {
    if (this.session) {
      this.session.close();
    }
    counterAdd('reconnectCount', 1);

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
    this.sessionID = sessionID;
    this.secret = secret;
    if (this.isConnected()) {
      this.disconnect();
    }
    this.session = new WebSocket(`${MULTIPLAYER_SETTINGS.websocketSession}/${sessionID}?client=${this.id}&instance=${this.instance}&secret=${secret}`);
    this.session.onmessage = this.onMessage.bind(this);
    this.session.onerror = console.error;
    this.session.onclose = this.onClose.bind(this);
    this.session.onopen = this.onOpen.bind(this);
  }

  private onMessage(ev: MessageEvent) {
    const e = this.parseEvent(ev.data);
    // Update stats
    counterAdd('receivedEvents', 1);
    if (e.event.type === 'ERROR') {
      counterAdd('errorEvents', 1);
    }
    const buffered = (this.messageBuffer.filter((b) => b.id === e.id)).length > 0;
    if (e.id !== null) {
      this.removeFromQueue(e.id);
    }
    this.handler.onEvent(e, buffered);
  }

  private onOpen() {
    counterAdd('sessionCount', 1);
    this.handler.onConnectionChange(true);
    console.log('WS: open');
    this.connected = true;
  }

  private onClose(ev: CloseEvent) {
    counterAdd('disconnectCount', 1);
    this.handler.onConnectionChange(false);
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
        console.error('WS: abnormal closure evt', ev.code, ev.reason);
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
  }

  public disconnect() {
    this.connected = false;
    this.session.close(1000);
    this.resetState();
  }

  public sendEvent(event: MultiplayerEventBody, commitID: number): void {
    if (!this.isConnected()) {
      return;
    }
    const id = (event.type === 'ACTION') ? (this.getMaxBufferID() || commitID) + 1 : null;
    this.sendFinalizedEvent({
      id,
      client: this.id,
      instance: this.instance,
      event,
    });
  }

  private sendFinalizedEvent(event: MultiplayerEvent): void {
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
}

// TODO: Proper device ID
let client: Connection|null = null;
export function getMultiplayerConnection(): Connection {
  if (client !== null) {
    return client;
  }
  client = new Connection();
  return client;
}

export function setMultiplayerConnection(c: Connection) {
  client = c;
}

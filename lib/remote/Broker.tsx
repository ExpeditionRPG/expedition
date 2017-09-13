import * as Bluebird from 'bluebird'
import {RemotePlayEvent, ClientID} from './Events'

export type SessionID = number;
export type SessionSecret = string; // 4-character entry code
export type SessionLock = Date;

export interface Session {
  secret?: SessionSecret;
  id?: SessionID;
  lock?: SessionLock;
}

function makeSecret(): SessionSecret {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (var i = 0; i < 4; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export abstract class BrokerBase {
  abstract storeSession(s: Session): Bluebird<any>;
  abstract fetchSessionBySecret(secret: SessionSecret): Bluebird<Session>;
  abstract fetchSessionById(id: SessionID): Bluebird<Session>;
  abstract addClient(c: ClientID, s: Session): Bluebird<boolean>;
  abstract broadcast(e: RemotePlayEvent): void;

  createSession(): Bluebird<Session> {
    const s: Session = {secret: makeSecret(), id: Date.now(), lock: null};
    return this.storeSession(s).then(() => {
      return s;
    });
  }

  joinSession(cID: ClientID, secret: SessionSecret): Bluebird<boolean> {
    return this.fetchSessionBySecret(secret)
      .then((s: Session) => {
        if (!s) {
          return false;
        }
        if (s.lock) {
          return false;
        } else {
          return this.addClient(cID, s).then(() => {return true;});
        }
      });
  }

  lockSession(s: SessionID): Bluebird<boolean> {
    // After everyone joins, prevent new session joiners.
    return this.fetchSessionById(s).then((s: Session) => {
      return this.storeSession({...s, lock: new Date()});
    });
  }
}

export class InMemoryBroker extends BrokerBase {
  sessions: Session[];
  clients: {client: ClientID, session: SessionID}[];
  handlers: {[c: string]: (e: RemotePlayEvent)=>any};

  constructor() {
    super();
    this.sessions = [];
    this.clients = [];
    this.handlers = {};
  }

  storeSession(s: Session): Bluebird<any> {
    return new Bluebird((resolve, reject) => {
      for(let i = 0; i < this.sessions.length; i++) {
        if (this.sessions[i].id === s.id) {
          this.sessions[i] = s;
          return resolve();
        }
      }
      this.sessions.push(s);
      return resolve();
    })

  }

  fetchSessionBySecret(secret: SessionSecret): Bluebird<Session> {
    return new Bluebird((resolve, reject) => {
      for(let i = 0; i < this.sessions.length; i++) {
        if (this.sessions[i].secret === secret) {
          return resolve(this.sessions[i]);
        }
      }
      return reject();
    });
  }

  fetchSessionById(id: SessionID): Bluebird<Session> {
    return new Bluebird((resolve, reject) => {
      for(let i = 0; i < this.sessions.length; i++) {
        if (this.sessions[i].id === id) {
          return resolve(this.sessions[i]);
        }
      }
      return reject();
    });
  }

  addClient(c: ClientID, s: Session): Bluebird<boolean> {
    this.clients.push({client: c, session: s.id});
    return Bluebird.resolve(true);
  }

  addClientHandler(c: ClientID, ch: (e: RemotePlayEvent)=>any) {
    this.handlers[c] = ch;
  }

  broadcast(e: RemotePlayEvent): void {
    for (const c of this.clients) {
      if (c.client === e.client) {
        const session = c.session;
        for (const d of this.clients) {
          if (d.session === session && d.client !== e.client) {
            this.handlers[d.client] && this.handlers[d.client](e);
          }
        }
      }
    }
  }
}

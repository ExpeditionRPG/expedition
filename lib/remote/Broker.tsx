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
  abstract storeSession(s: Session): Promise<any>;
  abstract addClient(c: ClientID, s: Session): Promise<any>;

  abstract fetchSessionBySecret(secret: SessionSecret): Promise<Session>;
  abstract fetchSessionById(id: SessionID): Promise<Session>;
  abstract fetchSessionsByClient(client: ClientID): Promise<Session[]>;

  createSession(): Promise<Session> {
    const s: Session = {secret: makeSecret(), id: Date.now(), lock: null};
    return this.storeSession(s).then(() => {
      return s;
    });
  }

  joinSession(cID: ClientID, secret: SessionSecret): Promise<SessionID> {
    return this.fetchSessionBySecret(secret)
      .then((s: Session) => {
        if (!s) {
          throw new Error("Session not set");
        }
        if (s.lock) {
          throw new Error("Session is locked");
        } else {
          return this.addClient(cID, s).then(() => {return s.id;});
        }
      });
  }

  lockSession(s: SessionID): Promise<boolean> {
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

  storeSession(s: Session): Promise<any> {
    return new Promise((resolve, reject) => {
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

  fetchSessionBySecret(secret: SessionSecret): Promise<Session> {
    return new Promise((resolve, reject) => {
      for (let i = 0; i < this.sessions.length; i++) {
        if (this.sessions[i].secret === secret) {
          return resolve(this.sessions[i]);
        }
      }
      return reject();
    });
  }

  fetchSessionById(id: SessionID): Promise<Session> {
    return new Promise((resolve, reject) => {
      for (let i = 0; i < this.sessions.length; i++) {
        if (this.sessions[i].id === id) {
          return resolve(this.sessions[i]);
        }
      }
      return reject();
    });
  }

  fetchSessionsByClient(client: ClientID): Promise<Session[]> {
    return new Promise<Session[]>((resolve, reject) => {
      const sessions = this.clients.filter((c) => {return c.client === client;}).map((c) => {return c.session;});

      const results: Session[] = [];
      for (const s1 of sessions) {
        for (const s2 of this.sessions) {
          if (s2.id === s1) {
            results.push(s2);
          }
        }
      }
      return resolve(results);
    });
  }

  addClient(c: ClientID, s: Session): Promise<boolean> {
    this.clients.push({client: c, session: s.id});
    return Promise.resolve(true);
  }

  addClientHandler(c: ClientID, ch: (e: RemotePlayEvent)=>any) {
    this.handlers[c] = ch;
  }
}

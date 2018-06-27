import * as Promise from 'bluebird';
import * as express from 'express';
import * as http from 'http';
import {ActionEvent, ClientID, MultiEvent, MultiplayerEvent, StatusEvent, WaitType} from 'shared/multiplayer/Events';
import {toClientKey} from 'shared/multiplayer/Session';
import * as url from 'url';
import * as WebSocket from 'ws';
import Config from '../config';
import {Database, EventInstance, SessionClientInstance, SessionInstance} from '../models/Database';
import {commitEvent, commitEventWithoutID, getLargestEventID, getLastEvent, getOrderedEventsAfter} from '../models/multiplayer/Events';
import {getClientSessions, verifySessionClient} from '../models/multiplayer/SessionClients';
import {createSession, getSessionBySecret, getSessionQuestTitle} from '../models/multiplayer/Sessions';
import {maybeChaosDB, maybeChaosWS} from './Chaos';

export interface MultiplayerSessionMeta {
  id: number;
  lastAction: Date;
  peerCount: number;
  questTitle: string;
  secret: string;
}

export function user(db: Database, req: express.Request, res: express.Response) {
  return getClientSessions(db, res.locals.id).then((sessions: SessionClientInstance[]) => {
    return Promise.all(sessions.map((sci: SessionClientInstance) => {
      const id = sci.get('session');
      const meta: Partial<MultiplayerSessionMeta> = {
        id,
        peerCount: sessionClientCount(id),
        secret: sci.get('secret'),
      };

      if (meta.peerCount === undefined || meta.peerCount <= 0) {
        return null;
      }

      // Get last action on this session
      return getLastEvent(db, id)
        .then((e: EventInstance) => {
          if (e === null) {
            return null;
          }
          meta.lastAction = e.get('timestamp');
          return getSessionQuestTitle(db, id);
        })
        .then((q: string|null) => {
          if (q === null) {
            return null;
          }
          meta.questTitle = q;
          return meta;
        });
    }));
  })
  .filter((m: MultiplayerSessionMeta|null) => m !== null)
  .then((history: MultiplayerSessionMeta[]) => {
    res.status(200).end(JSON.stringify({history}));
  })
  .catch((e: Error) => {
    return res.status(500).end(JSON.stringify({error: 'Error looking up user details: ' + e.toString()}));
  });
}

export function newSession(db: Database, req: express.Request, res: express.Response) {
  return createSession(db).then((s: SessionInstance) => {
    res.status(200).end(JSON.stringify({secret: s.get('secret')}));
  })
  .catch((e: Error) => {
    return res.status(500).end(JSON.stringify({error: 'Error creating session: ' + e.toString()}));
  });
}

export function connect(db: Database, req: express.Request, res: express.Response) {
  let body: any;
  try {
    body = JSON.parse(req.body);
  } catch (e) {
    return res.status(500).end('Error reading request.');
  }

  let session: SessionInstance;
  getSessionBySecret(db, body.secret)
    .then((s: SessionInstance) => {
      session = s;
      if (!session) {
        res.status(404).send();
        return Promise.reject(null);
      }
      return db.sessionClients.upsert({
        client: res.locals.id,
        secret: body.secret,
        session: session.get('id'),
      });
    })
    .then(() => {
      return res.status(200).end(JSON.stringify({session: session.get('id')}));
    })
    .catch((e: Error) => {
      if (e) {
        return res.status(500).end(JSON.stringify({
          error: 'Could not join session: ' + e.toString(),
        }));
      }
      return null;
    });
}

interface WebsocketSessionParams {
  client: string;
  instance: string;
  secret: string;
  session: number;
}

function wsParamsFromReq(req: http.IncomingMessage): WebsocketSessionParams|null {
  if (!req || !req.url) {
    console.error('req.url not defined', req);
    return null;
  }
  const parsedURL = url.parse(req.url, true);
  if (!parsedURL || !parsedURL.pathname) {
    console.error('failed to parse url ', req.url);
    return null;
  }
  const splitPath = parsedURL.pathname.match(/\/ws\/multiplayer\/v1\/session\/(\d+).*/);

  if (splitPath === null) {
    console.error('Invalid upgrade request path, cancelling websocket connection.');
    return null;
  }

  return {
    client: parsedURL.query.client as string,
    instance: parsedURL.query.instance as string,
    secret: parsedURL.query.secret as string,
    session: parseInt(splitPath[1], 10),
  };
}

export function verifyWebsocket(db: Database, info: {origin: string, secure: boolean, req: http.IncomingMessage}, cb: (result: boolean) => any) {
  const params = wsParamsFromReq(info.req);
  if (params === null) {
    return cb(false);
  }
  return verifySessionClient(db, params.session, params.client, params.secret)
    .then((verified: boolean) => {
      return cb(verified);
    })
    .catch((e: Error) => {
      console.error(e);
      cb(false);
    });
}

const inMemorySessions: {[sessionID: number]: {
  [clientAndInstance: string]: {socket: WebSocket, status: StatusEvent|null, client: string, instance: string}
}} = {};

export function sessionClientCount(sessionID: number): number {
  const session = inMemorySessions[sessionID] || {};
  const instances = Object.keys(session);
  return instances.length;
}

function broadcast(session: number, msg: string) {
  if (inMemorySessions[session] === null) {
    return;
  }
  for (const peerID of Object.keys(inMemorySessions[session])) {
    const peerWS = inMemorySessions[session][peerID] && inMemorySessions[session][peerID].socket;
    if (peerWS && peerWS.readyState === WebSocket.OPEN) {
      peerWS.send(msg, (e: Error) => {
        console.error(e);
      });
    }
  }
}

function makeMultiEvent(db: Database, session: number, lastEventID: number) {
  return getOrderedEventsAfter(db, session, lastEventID).then((eventInstances: (EventInstance[]|null)) => {
    if (eventInstances === null) {
      return;
    }
    let lastId = 0;
    const events = eventInstances.filter((e: EventInstance) => {
        // For now, only return action events when fast-forwarding.
        return e.get('id') !== null;
      }).map((e: EventInstance) => {
        lastId = Math.max(lastId, e.get('id'));
        return e.get('json');
      });
    return {type: 'MULTI_EVENT', events, lastId};
  });
}

// Identify most recent event and fast forward the client if they're behind
function maybeFastForwardClient(db: Database, session: number, client: ClientID, instance: string, lastEventID: number, ws: WebSocket) {
  getLargestEventID(db, session).then((dbLastEventID: number) => {
    if (lastEventID >= dbLastEventID) {
      return;
    }
    makeMultiEvent(db, session, lastEventID).then((event: MultiEvent) => {
      if (ws.readyState !== WebSocket.OPEN) {
        return;
      }
      ws.send(JSON.stringify({
        client: 'SERVER',
        event,
        id: null,
        instance: Config.get('NODE_ENV'),
      } as MultiplayerEvent), (e: Error) => {
        console.error(e);
      });
    });
  });
}

// We need a little custom server code to pay attention when clients
// are all waiting on something.
function handleClientStatus(db: Database, session: number, client: ClientID, instance: string, ev: StatusEvent, ws: WebSocket) {
  console.log(toClientKey(client, instance) + ': ' + JSON.stringify(ev));

  const s = inMemorySessions[session];
  let cli = s[toClientKey(client, instance)];
  if (!cli) {
    s[toClientKey(client, instance)] = {
      client,
      instance,
      socket: ws,
      status: null,
    };
    cli = s[toClientKey(client, instance)];
  }
  cli.status = ev;

  const waitCounts: {[wait: string]: number} = {};
  let maxElapsedMillis = 0;
  for (const c of Object.keys(s)) {
    const sc = s[c];
    if (!sc || sc.status === null) {
      continue;
    }
    const wo: WaitType|undefined = sc.status.waitingOn;
    if (wo) {
      waitCounts[wo.type] = (waitCounts[wo.type] || 0) + 1;
      if (wo.type === 'TIMER') {
        maxElapsedMillis = Math.max(maxElapsedMillis, wo.elapsedMillis);
      }
    }
  }

  if (waitCounts.TIMER === Object.keys(s).length) {
    const combatStopEvent = {
      client: 'SERVER',
      event: {
        args: JSON.stringify({elapsedMillis: maxElapsedMillis, seed: Date.now()}),
        name: 'handleCombatTimerStop',
        type: 'ACTION',
      } as ActionEvent,
      id: null,
      instance: Config.get('NODE_ENV'),
    } as MultiplayerEvent;

    commitEventWithoutID(db, session, client, instance, 'ACTION', combatStopEvent)
      .then((eventCount: number|null) => {
        // Broadcast to all peers - note that the event will be set by commitEventWithoutID
        broadcast(session, JSON.stringify(combatStopEvent));
      })
      .catch((error: Error) => {
        broadcast(session, JSON.stringify({
          client: 'SERVER',
          event: {
            error: 'Server error: ' + error.toString(),
            type: 'ERROR',
          },
          id: null,
          instance: Config.get('NODE_ENV'),
        } as MultiplayerEvent));
      });
  }

  const lastEventID = ev.lastEventID;
  if (lastEventID !== null && lastEventID !== undefined) {
    maybeFastForwardClient(db, session, client, instance, lastEventID, s[toClientKey(client, instance)].socket);
  }
}

function sendError(ws: WebSocket, e: string) {
  console.error(e);
  ws.send(JSON.stringify({
    client: 'SERVER',
    event: {
      error: e,
      type: 'ERROR',
    },
    id: null,
    instance: Config.get('NODE_ENV'),
  } as MultiplayerEvent), (err: Error) => {
    console.error(err);
  });
}

export function websocketSession(db: Database, ws: WebSocket, req: http.IncomingMessage) {
  const params = wsParamsFromReq(req);
  if (params === null) {
    throw new Error('Null params, session not validated correctly');
  }

  console.log(`Client ${params.client} connected to session ${params.session} with secret ${params.secret}`);

  // Setup chaos handlers (if configured)
  db = maybeChaosDB(db, params.session, ws);
  ws = maybeChaosWS(ws);

  if (!inMemorySessions[params.session]) {
    inMemorySessions[params.session] = {};
  }
  inMemorySessions[params.session][toClientKey(params.client, params.instance)] = {
    client: params.client,
    instance: params.instance,
    socket: ws,
    status: null,
  };

  if (ws.readyState === WebSocket.OPEN) {
    // Replay latest client statuses to the new socket so they know
    // who is connected.
    const s = inMemorySessions[params.session];
    if (s) {
      for (const k of Object.keys(s)) {
        if (!s[k].status) {
          continue;
        }
        console.log('Initial notify of status for ' + k);

        ws.send(JSON.stringify({
          client: s[k].client,
          event: s[k].status,
          id: null,
          instance: s[k].instance,
        } as MultiplayerEvent), (e: Error) => {
          console.error(e);
        });
      }
    }
  }

  ws.on('message', (msg: WebSocket.Data) => {
    if (typeof(msg) !== 'string') {
      sendError(ws, 'Invalid type for inbound message: ' + typeof(msg));
      return;
    }

    let event: MultiplayerEvent;
    try {
      event = JSON.parse(msg);
    } catch (e) {
      sendError(ws, 'Could not parse inbound event starting with: ' + msg.substr(0, 32));
      return;
    }

    if (!event || !event.event || !event.event.type) {
      sendError(ws, 'No parsed type for event starting with: ' + msg.substr(0, 32));
      return;
    }

    // If it's not a transactioned action, just broadcast it.
    if (event.event.type !== 'ACTION') {
      broadcast(params.session, msg);
      if (event.event.type === 'STATUS') {
        handleClientStatus(db, params.session, event.client, event.instance, event.event, ws);
      }
      return;
    }

    // Precondition: event is an ACTION
    const eventID = event.id;
    if (eventID === null) {
      sendError(ws, 'Received ACTION event with null ID');
      return;
    }

    commitEvent(db, params.session, params.client, params.instance, eventID, event.event.type, msg)
      .then((result: number|null) => {
        broadcast(params.session, msg);
      })
      .catch((error: Error) => {
        console.error(error);
        let multiEvent: MultiEvent|null = null;
        makeMultiEvent(db, params.session, eventID).then((e: MultiEvent) => {
          multiEvent = e;
        }).catch((e: Error) => {
          sendError(ws, e.toString());
        }).finally(() => {
          ws.send(JSON.stringify({
            client: 'SERVER',
            event: multiEvent,
            id: null,
            instance: Config.get('NODE_ENV'),
          } as MultiplayerEvent), (e?: Error) => {
            if (e) {
              sendError(ws, e.toString());
            }
          });
        });
      });
  });

  ws.on('close', () => {
    delete inMemorySessions[params.session][toClientKey(params.client, params.instance)];

    // Notify other clients this client has disconnected
    broadcast(params.session, JSON.stringify({
      client: params.client,
      event: {
        connected: false,
        type: 'STATUS',
      },
      id: null,
      instance: params.instance,
    } as MultiplayerEvent));
  });
}

import Config from '../config'
import * as express from 'express'
import * as Sequelize from 'sequelize'
import {SessionID, toClientKey} from 'expedition-qdl/lib/remote/Session'
import {Session as SessionModel, SessionInstance} from '../models/remoteplay/Sessions'
import {EventInstance} from '../models/remoteplay/Events'
import {SessionClient, SessionClientInstance} from '../models/remoteplay/SessionClients'
import {ClientID, WaitType, StatusEvent, ActionEvent, RemotePlayEvent, MultiEvent} from 'expedition-qdl/lib/remote/Events'
import {maybeChaosWS, maybeChaosSession, maybeChaosSessionClient} from './Chaos'
import * as url from 'url'
import * as http from 'http'
import * as WebSocket from 'ws'


export interface RemotePlaySessionMeta {
  id: number;
  questTitle: string;
  peerCount: number;
  lastAction: Date;
}

export function user(sc: SessionClient, req: express.Request, res: express.Response) {
  sc.getSessionsByClient(res.locals.id).then((lastEvents: EventInstance[]) => {
    // TODO get current quest name from action = fetchQuestXML
    const sessionMetadata = lastEvents.map((e: EventInstance) => {
      return {
        id: e.get('session'),
        questTitle: '',
        peerCount: sessionClientCount(e.get('session')),
        lastAction: e.get('updated_at'),
      };
    }).filter((session: RemotePlaySessionMeta) => {
      return session.peerCount > 0;
    });
    res.status(200).send(JSON.stringify({history: sessionMetadata}));
  })
  .catch((e: Error) => {
    return res.status(500).send(JSON.stringify({error: 'Error looking up user details: ' + e.toString()}));
  });
}

export function newSession(rpSessions: SessionModel, req: express.Request, res: express.Response) {
  rpSessions.create().then((s: SessionInstance) => {
    res.status(200).send(JSON.stringify({secret: s.get('secret')}));
  })
  .catch((e: Error) => {
    return res.status(500).send(JSON.stringify({error: 'Error creating session: ' + e.toString()}));
  });
}

export function connect(rpSessions: SessionModel, sessionClients: SessionClient, req: express.Request, res: express.Response) {
  let body: any;
  try {
    body = JSON.parse(req.body);
  } catch (e) {
    return res.status(500).end('Error reading request.');
  }

  let session: SessionInstance;
  rpSessions.getBySecret(body.secret)
    .then((s: SessionInstance) => {
      session = s;
      return sessionClients.upsert(session.get('id'), res.locals.id, body.secret);
    })
    .then(() => {
      return res.status(200).send(JSON.stringify({session: session.get('id')}));
    })
    .catch((e: Error) => {
      return res.status(500).send(JSON.stringify({
        error: 'Could not join session: ' + e.toString()
      }));
    });
}

interface WebsocketSessionParams {
  session: number;
  client: string;
  secret: string;
  instance: string;
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
  const splitPath = parsedURL.pathname.match(/\/ws\/remoteplay\/v1\/session\/(\d+).*/);

  if (splitPath === null) {
    console.error('Invalid upgrade request path, cancelling websocket connection.');
    return null;
  }

  return {
    session: parseInt(splitPath[1], 10),
    client: parsedURL.query.client,
    secret: parsedURL.query.secret,
    instance: parsedURL.query.instance,
  };
}

export function verifyWebsocket(sessionClients: SessionClient, info: {origin: string, secure: boolean, req: http.IncomingMessage}, cb: (result: boolean) => any) {
  const params = wsParamsFromReq(info.req);
  if (params === null) {
    return cb(false);
  }
  sessionClients.verify(params.session, params.client, params.secret)
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

function makeMultiEvent(rpSession: SessionModel, session: number, lastEventID: number) {
  return rpSession.getOrderedAfter(session, lastEventID).then((eventInstances: (EventInstance[]|null)) => {
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
function maybeFastForwardClient(rpSession: SessionModel, session: number, client: ClientID, instance: string, lastEventID: number, ws: WebSocket) {
  rpSession.getLargestEventID(session).then((dbLastEventID: number) => {
    if (lastEventID >= dbLastEventID) {
      return;
    }
    makeMultiEvent(rpSession, session, lastEventID).then((event: MultiEvent) => {
      if (ws.readyState !== WebSocket.OPEN) {
        return;
      }
      ws.send(JSON.stringify({
        client: 'SERVER',
        instance: Config.get('NODE_ENV'),
        id: null,
        event
      } as RemotePlayEvent), (e: Error) => {console.error(e);});
    });
  });
}

// We need a little custom server code to pay attention when clients
// are all waiting on something.
function handleClientStatus(rpSession: SessionModel, session: number, client: ClientID, instance: string, ev: StatusEvent, ws: WebSocket) {
  console.log(toClientKey(client, instance) + ': ' + JSON.stringify(ev));

  const s = inMemorySessions[session];
  let cli = s[toClientKey(client, instance)];
  if (!cli) {
    s[toClientKey(client, instance)] = {
      socket: ws,
      status: null,
      client: client,
      instance: instance,
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

  if (waitCounts['TIMER'] === Object.keys(s).length) {
    const combatStopEvent = {
      client: 'SERVER',
      instance: Config.get('NODE_ENV'),
      event: {
        type: 'ACTION',
        name: 'handleCombatTimerStop',
        args: JSON.stringify({elapsedMillis: maxElapsedMillis, seed: Date.now()}),
      } as ActionEvent,
      id: null,
    } as RemotePlayEvent;

    rpSession.commitEventWithoutID(session, client, instance, 'ACTION', combatStopEvent)
      .then((eventCount: number|null) => {
        // Broadcast to all peers - note that the event will be set by commitEventWithoutID
        broadcast(session, JSON.stringify(combatStopEvent));
      })
      .catch((error: Error) => {
        broadcast(session, JSON.stringify({
          client: 'SERVER',
          instance: Config.get('NODE_ENV'),
          event: {
            type: 'ERROR',
            error: 'Server error: ' + error.toString(),
          },
          id: null
        } as RemotePlayEvent));
      });
  }

  const lastEventID = ev.lastEventID;
  if (lastEventID !== null && lastEventID !== undefined) {
    maybeFastForwardClient(rpSession, session, client, instance, lastEventID, s[toClientKey(client, instance)].socket);
  }
}

function sendError(ws: WebSocket, e: string) {
  console.error(e);
  ws.send(JSON.stringify({
    client: 'SERVER',
    instance: Config.get('NODE_ENV'),
    event: {
      type: 'ERROR',
      error: e,
    },
    id: null
  } as RemotePlayEvent), (e: Error) => {
    console.error(e);
  });
}

export function websocketSession(rpSession: SessionModel, sessionClients: SessionClient, ws: WebSocket, req: http.IncomingMessage) {
  const params = wsParamsFromReq(req);
  if (params === null) {
    throw new Error('Null params, session not validated correctly');
  }

  console.log(`Client ${params.client} connected to session ${params.session} with secret ${params.secret}`);

  // Setup chaos handlers (if configured)
  rpSession = maybeChaosSession(rpSession, params.session, ws);
  sessionClients = maybeChaosSessionClient(sessionClients);
  ws = maybeChaosWS(ws);

  if (!inMemorySessions[params.session]) {
    inMemorySessions[params.session] = {};
  }
  inMemorySessions[params.session][toClientKey(params.client, params.instance)] = {
    socket: ws,
    status: null,
    client: params.client,
    instance: params.instance,
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
          instance: s[k].instance,
          event: s[k].status,
          id: null,
        } as RemotePlayEvent), (e: Error) => {
          console.error(e);
        });
      }
    }
  }


  ws.on('message', (msg: WebSocket.Data) => {
    // Ignore pings
    if (msg === 'PING') {
      return;
    }

    if (typeof(msg) !== 'string') {
      sendError(ws, 'Invalid type for inbound message: ' + typeof(msg));
      return;
    }

    let event: RemotePlayEvent;
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
        handleClientStatus(rpSession, params.session, event.client, event.instance, event.event, ws);
      }
      return;
    }

    // Precondition: event is an ACTION
    const eventID = event.id;
    if (eventID === null) {
      console.error('Received ACTION event with null ID');
      return;
    }

    rpSession.commitEvent(params.session, params.client, params.instance, eventID, event.event.type, msg)
    .then((result: number|null) => {
      broadcast(params.session, msg);
    })
    .catch((error: Error) => {
      let multiEvent: MultiEvent|null = null;
      makeMultiEvent(rpSession, params.session, eventID).then((e: MultiEvent) => {
        multiEvent = e;
      }).catch((e: Error) => {
        console.error('makeMultiEvent Error: ' + e);
      }).finally(() => {
        ws.send(JSON.stringify({
          client: 'SERVER',
          instance: Config.get('NODE_ENV'),
          id: null,
          event: multiEvent,
        } as RemotePlayEvent), (e: Error) => {console.error(e);});
      });
    });
  });

  ws.on('close', () => {
    delete inMemorySessions[params.session][toClientKey(params.client, params.instance)];

    // Notify other clients this client has disconnected
    broadcast(params.session, JSON.stringify({
      client: params.client,
      instance: params.instance,
      event: {
        type: 'STATUS',
        connected: false,
      },
      id: null,
    } as RemotePlayEvent));
  });
}

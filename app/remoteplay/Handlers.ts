import Config from '../config'
import * as express from 'express'
import * as Sequelize from 'sequelize'
import {Session, SessionID, SessionMetadata} from 'expedition-qdl/lib/remote/Session'
import {Session as SessionModel, SessionInstance} from '../models/remoteplay/Sessions'
import {SessionClient, SessionClientInstance} from '../models/remoteplay/SessionClients'
import {ClientID, WaitType, StatusEvent, ActionEvent, RemotePlayEvent, InflightCommitEvent, InflightRejectEvent} from 'expedition-qdl/lib/remote/Events'
import * as url from 'url'
import * as http from 'http'
import * as WebSocket from 'ws'

export function user(sc: SessionClient, req: express.Request, res: express.Response) {
  if (!res.locals || !res.locals.id) {
    return res.status(500).end('You are not signed in.');
  }

  sc.getSessionsByClient(res.locals.id).then((fetched: any[]) => {
    // TODO map data to most recent event, plus number of other players connected
    res.status(200).send(JSON.stringify({history: fetched}));
  })
  .catch((e: Error) => {
    return res.status(500).send(JSON.stringify({error: 'Error looking up user details: ' + e.toString()}));
  });
}

export function newSession(rpSessions: SessionModel, req: express.Request, res: express.Response) {
  if (!res.locals || !res.locals.id) {
    return res.status(500).end('You are not signed in.');
  }

  rpSessions.create().then((s: SessionInstance) => {
    res.status(200).send(JSON.stringify({secret: s.dataValues.secret}));
  })
  .catch((e: Error) => {
    return res.status(500).send(JSON.stringify({error: 'Error creating session: ' + e.toString()}));
  });
}

export function connect(rpSessions: SessionModel, sessionClients: SessionClient, req: express.Request, res: express.Response) {
  if (!res.locals || !res.locals.id) {
    return res.status(500).end('You are not signed in.');
  }

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
      return sessionClients.upsert(session.dataValues.id, res.locals.id, body.secret);
    })
    .then(() => {
      return res.status(200).send(JSON.stringify({session: session.dataValues.id}));
    })
    .catch((e: Error) => {
      return res.status(500).send(JSON.stringify({
        error: 'Could not join session: ' + e.toString()
      }));
    });
}

function wsParamsFromReq(req: http.IncomingMessage) {
  if (!req || !req.url) {
    console.error('req.url not defined');
    console.log(req);
    return null;
  }
  const parsedURL = url.parse(req.url, true);
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

const inMemorySessions: {[sessionID: number]: {[clientAndInstance: string]: any}} = {};

function broadcastFrom(session: number, client: string, instance: string, msg: string) {
  if (inMemorySessions[session] === null) {
    return;
  }
  for (const peerID of Object.keys(inMemorySessions[session])) {
    if (peerID === clientKey(client, instance) || inMemorySessions[session][peerID] === null) {
      continue;
    }

    const peerWS = inMemorySessions[session][peerID] && inMemorySessions[session][peerID].socket;
    if (peerWS && peerWS.readyState === 1 /* OPEN */) {
      peerWS.send(msg);
    }
  }
}

function clientKey(client: ClientID, instance: string) {
  return client+'|'+instance;
}

// We need a little custom server code to pay attention when clients
// are all waiting on something.
function handleClientStatus(rpSession: SessionModel, session: number, client: ClientID, instance: string, ev: StatusEvent) {
  const s = inMemorySessions[session];
  s[clientKey(client, instance)].status = ev;

  const waitCounts: {[wait: string]: number} = {};
  let maxElapsedMillis = 0;
  for (const c of Object.keys(s)) {
    if (!s[c] || !s[c].status) {
      continue;
    }
    const wo: WaitType = s[c].status.waitingOn;
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

    rpSession.commitEvent(session, client, null, 'ACTION', JSON.stringify(combatStopEvent))
      .then((eventCount: number) => {
        // Broadcast to all peers
        combatStopEvent.id = eventCount;
        broadcastFrom(session, '', '', JSON.stringify(combatStopEvent));
      })
      .catch((error: Error) => {
        broadcastFrom(session, '', '', JSON.stringify({
          client: 'SERVER',
          instance: Config.get('NODE_ENV'),
          event: {
            type: 'ERROR',
            error: error.toString(),
          },
          id: null
        } as RemotePlayEvent));
      });
  }
}

export function websocketSession(rpSession: SessionModel, sessionClients: SessionClient, ws: any, req: http.IncomingMessage) {
  const params = wsParamsFromReq(req);
  console.log(`Client ${params.client} connected to session ${params.session} with secret ${params.secret}`);

  if (!inMemorySessions[params.session]) {
    inMemorySessions[params.session] = {};
  }
  inMemorySessions[params.session][clientKey(params.client, params.instance)] = {
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
        } as RemotePlayEvent));
      }
    }
  }


  ws.on('message', (msg: any) => {
    // Ignore pings
    if (msg === 'PING') {
      return;
    }

    const event: RemotePlayEvent = JSON.parse(msg);

    // If it's not a transactioned action, just broadcast it.
    // TODO: Log it as well as actions
    if (event.event.type !== 'ACTION') {
      broadcastFrom(params.session, params.client, params.instance, msg);

      if (event.event.type === 'STATUS') {
        handleClientStatus(rpSession, params.session, event.client, event.instance, event.event);
      }

      return;
    }

    setTimeout(() => {
      rpSession.commitEvent(params.session, params.client, event.id, event.event.type, msg)
      .then(() => {
        // Broadcast to all peers
        broadcastFrom(params.session, params.client, params.instance, msg);
        ws.send(JSON.stringify({...event, event:{
          type: 'INFLIGHT_COMMIT',
          id: event.id,
        }} as RemotePlayEvent));
      })
      .catch((error: Error) => {
        ws.send(JSON.stringify({...event, event: {
          type: 'INFLIGHT_REJECT',
          id: event.id,
          error: error.toString(),
        }} as RemotePlayEvent));
      });
    }, Config.get('REMOTE_PLAY_COMMIT_LAG_MILLIS') || 0);

  });

  ws.on('close', () => {
    delete inMemorySessions[params.session][clientKey(params.client, params.instance)];

    // Notify other clients this client has disconnected
    broadcastFrom(params.session, params.client, params.instance, JSON.stringify({
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

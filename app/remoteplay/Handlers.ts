import * as express from 'express'
import * as Sequelize from 'sequelize'
import {Session, SessionID, SessionMetadata} from 'expedition-qdl/lib/remote/Session'
import {Session as SessionModel, SessionInstance} from '../models/remoteplay/Sessions'
import {SessionClient, SessionClientInstance} from '../models/remoteplay/SessionClients'
import {ClientID, RemotePlayEvent, InflightCommitEvent, InflightRejectEvent} from 'expedition-qdl/lib/remote/Events'
import * as url from 'url'
import * as http from 'http'

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
  for(const peerID of Object.keys(inMemorySessions[session])) {
    if (peerID === client+'|'+instance) {
      continue;
    }

    const peerWS = inMemorySessions[session][peerID];
    if (peerWS) {
      peerWS.send(msg);
    }
  }
}

export function websocketSession(rpSession: SessionModel, sessionClients: SessionClient, ws: any, req: http.IncomingMessage) {
  const params = wsParamsFromReq(req);
  console.log(`Client ${params.client} connected to session ${params.session} with secret ${params.secret}`);

  if (!inMemorySessions[params.session]) {
    inMemorySessions[params.session] = {};
  }
  inMemorySessions[params.session][params.client+'|'+params.instance] = ws;

  // TODO: Broadcast new client event to other clients

  ws.on('message', (msg: any) => {
    const event: RemotePlayEvent = JSON.parse(msg);

    // If it's not a transactioned action, just broadcast it.
    if (event.event.type !== 'ACTION') {
      broadcastFrom(params.session, params.client, params.instance, msg);
      return;
    }

    rpSession.commitEvent(params.session, event.id, event.event.type, msg)
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
  });

  ws.on('close', () => {
    inMemorySessions[params.session][params.client] = null;
    // TODO: Broadcast lost client to other clients
  });
}

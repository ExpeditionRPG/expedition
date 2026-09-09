import * as express from 'express';
import * as http from 'http';
import {
  ClientID,
  MultiEvent,
  MultiplayerEvent,
  StatusEvent,
} from 'shared/multiplayer/Events';
import { toClientKey } from 'shared/multiplayer/Session';
import * as url from 'url';
import * as WebSocket from 'ws';
import Config from '../config';
import {
  Database,
  EventInstance,
  SessionClientInstance,
  SessionInstance,
} from '../models/Database';
import {
  commitEvent,
  getLargestEventID,
  getLastEvent,
  getOrderedEventsAfter,
} from '../models/multiplayer/Events';
import {
  getClientSessions,
  verifySessionClient,
} from '../models/multiplayer/SessionClients';
import {
  createSession,
  getSessionBySecret,
  getSessionQuestTitle,
} from '../models/multiplayer/Sessions';
import { maybeChaosDB, maybeChaosWS } from './Chaos';
import {
  getSession,
  initSessionClient,
  rmSessionClient,
  setClientStatus,
} from './Sessions';
import { handleWaitingOnReview, handleWaitingOnTimer } from './WaitingOn';
import { broadcast } from './Websockets';

export interface MultiplayerSessionMeta {
  id: number;
  lastAction: Date;
  peerCount: number;
  questTitle: string;
  secret: string;
}

export function user(
  db: Database,
  req: express.Request,
  res: express.Response,
) {
  return getClientSessions(db, res.locals.id)
    .then((sessions: SessionClientInstance[]) => {
      return Promise.all(
        sessions.map((sci: SessionClientInstance) => {
          const id = sci.get('session');
          const peerCount = Object.keys(getSession(id) || {}).length;
          const meta: Partial<MultiplayerSessionMeta> = {
            id,
            peerCount,
            secret: sci.get('secret'),
          };

          if (meta.peerCount === undefined || meta.peerCount <= 0) {
            // Resolved rather than bare: every other branch of this map is a
            // promise, and Promise.all over a mixed array is what
            // @typescript-eslint/await-thenable objects to.
            return Promise.resolve(null);
          }

          // Get last action on this session
          return getLastEvent(db, id)
            .then((e: EventInstance | null) => {
              if (e === null) {
                return null;
              }
              meta.lastAction = e.get('timestamp');
              return getSessionQuestTitle(db, id);
            })
            .then((q: string | null) => {
              if (q === null) {
                return null;
              }
              meta.questTitle = q;
              return meta;
            });
        }),
      );
    })
    .then((sessions: Array<Partial<MultiplayerSessionMeta> | null>) => {
      // Sessions with no peers or no last event come back as null.
      const history = sessions.filter(
        (m): m is Partial<MultiplayerSessionMeta> => m !== null,
      );
      res.status(200).end(JSON.stringify({ history }));
    })
    .catch((e: Error) => {
      return res.status(500).end(
        JSON.stringify({
          error: 'Error looking up user details: ' + e.toString(),
        }),
      );
    });
}

export function newSession(
  db: Database,
  req: express.Request,
  res: express.Response,
) {
  return createSession(db)
    .then((s: SessionInstance) => {
      res.status(200).end(JSON.stringify({ secret: s.get('secret') }));
    })
    .catch((e: Error) => {
      return res
        .status(500)
        .end(
          JSON.stringify({ error: 'Error creating session: ' + e.toString() }),
        );
    });
}

export function connect(
  db: Database,
  req: express.Request,
  res: express.Response,
) {
  let body: any;
  try {
    body = JSON.parse(req.body);
  } catch (e) {
    return res.status(500).end('Error reading request.');
  }

  let session: SessionInstance;
  return getSessionBySecret(db, body.secret)
    .then((s: SessionInstance | null) => {
      if (s === null) {
        return null;
      }
      session = s;
      return db.sessionClients.upsert({
        client: res.locals.id,
        secret: body.secret,
        session: session.get('id'),
      });
    })
    .then(() => {
      if (!session) {
        return res.status(404).send();
      }
      return res
        .status(200)
        .end(JSON.stringify({ session: session.get('id') }));
    })
    .catch((e: Error) => {
      if (e) {
        return res.status(500).end(
          JSON.stringify({
            error: 'Could not join session: ' + e.toString(),
          }),
        );
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

function wsParamsFromReq(
  req: http.IncomingMessage,
): WebsocketSessionParams | null {
  if (!req || !req.url) {
    console.error('req.url not defined', req);
    return null;
  }
  const parsedURL = url.parse(req.url, true);
  if (!parsedURL || !parsedURL.pathname) {
    console.error('failed to parse url ', req.url);
    return null;
  }
  const splitPath = parsedURL.pathname.match(
    /\/ws\/multiplayer\/v1\/session\/(\d+).*/,
  );

  if (splitPath === null) {
    console.error(
      'Invalid upgrade request path, cancelling websocket connection.',
    );
    return null;
  }

  if (
    ['client', 'instance', 'secret'].some(
      key => typeof parsedURL.query[key] !== 'string' || !parsedURL.query[key],
    )
  ) {
    return null;
  }
  return {
    client: parsedURL.query.client as string,
    instance: parsedURL.query.instance as string,
    secret: parsedURL.query.secret as string,
    session: parseInt(splitPath[1], 10),
  };
}

export function verifyWebsocket(
  db: Database,
  info: { origin: string; secure: boolean; req: http.IncomingMessage },
  cb: (result: boolean) => any,
) {
  const params = wsParamsFromReq(info.req);
  if (params === null) {
    return cb(false);
  }
  return verifySessionClient(db, params.session, params.client, params.secret)
    .then((verified: boolean) => {
      if (!verified) {
        return cb(false);
      }
      return db.sessions
        .findOne({ where: { id: params.session, locked: false } })
        .then(session => cb(session !== null));
    })
    .catch((e: Error) => {
      console.error('WS verify error:', e);
      cb(false);
    });
}

function makeMultiEvent(
  db: Database,
  session: number,
  lastEventID: number,
): Promise<MultiEvent | undefined> {
  return getOrderedEventsAfter(db, session, lastEventID).then(
    (eventInstances: EventInstance[] | null) => {
      if (eventInstances === null) {
        return;
      }
      let lastId = 0;
      const events = eventInstances
        .filter((e: EventInstance) => {
          // For now, only return action events when fast-forwarding.
          return e.get('id') !== null;
        })
        .map((e: EventInstance) => {
          lastId = Math.max(lastId, e.get('id'));
          return e.get('json');
        });
      return { type: 'MULTI_EVENT', events, lastId };
    },
  );
}

// Identify most recent event and fast forward the client if they're behind
function maybeFastForwardClient(
  db: Database,
  session: number,
  client: ClientID,
  instance: string,
  lastEventID: number,
  ws: WebSocket,
) {
  return getLargestEventID(db, session)
    .then((dbLastEventID: number) => {
      if (lastEventID >= dbLastEventID) {
        return;
      }
      return makeMultiEvent(db, session, lastEventID).then(
        (event: MultiEvent | undefined) => {
          if (event === undefined) {
            return;
          }
          sendSocketMessage(ws, {
            client: 'SERVER',
            event,
            id: null,
            instance: Config.get('NODE_ENV'),
          });
        },
      );
    })
    .catch((error: Error) => sendError(ws, error.toString()));
}

// We need a little custom server code to pay attention when clients
// are all waiting on something.
function handleClientStatus(
  db: Database,
  session: number,
  client: ClientID,
  instance: string,
  ev: StatusEvent,
  ws: WebSocket,
) {
  console.log(
    'Client key:',
    toClientKey(client, instance) + ': ' + JSON.stringify(ev),
  );

  setClientStatus(session, client, instance, ws, ev);
  handleWaitingOnTimer(db, session, client, instance);
  handleWaitingOnReview(db, session, client, instance);

  const lastEventID = ev.lastEventID;
  if (lastEventID !== null && lastEventID !== undefined) {
    maybeFastForwardClient(db, session, client, instance, lastEventID, ws);
  }
}

function sendSocketMessage(ws: WebSocket, event: MultiplayerEvent) {
  // DB work can complete after the peer closes. Never write or recursively send
  // another error on a socket that can no longer receive the response.
  if (ws.readyState !== WebSocket.OPEN) {
    return;
  }
  try {
    ws.send(JSON.stringify(event), (error?: Error) => {
      if (error) {
        console.error('WS send error:', error);
      }
    });
  } catch (error) {
    console.error('WS send error:', error);
  }
}

function sendError(ws: WebSocket, e: string) {
  console.error('WS Error:', e);
  sendSocketMessage(ws, {
    client: 'SERVER',
    event: { type: 'ERROR', error: e },
    id: null,
    instance: Config.get('NODE_ENV'),
  });
}

export function websocketSession(
  db: Database,
  ws: WebSocket,
  req: http.IncomingMessage,
) {
  const params = wsParamsFromReq(req);
  if (params === null) {
    throw new Error('Null params, session not validated correctly');
  }

  console.log(
    `Client ${params.client} connected to session ${params.session} with secret ${params.secret}`,
  );

  // Setup chaos handlers (if configured)
  db = maybeChaosDB(db, params.session, ws);
  ws = maybeChaosWS(ws);

  initSessionClient(params.session, params.client, params.instance, ws);

  // Replay latest client statuses to the new socket so they know
  // who is connected.
  if (ws.readyState === WebSocket.OPEN) {
    const s = getSession(params.session);
    if (s) {
      for (const k of Object.keys(s)) {
        if (!s[k].status) {
          continue;
        }
        console.log('Initial notify of status for ' + k);

        ws.send(
          JSON.stringify({
            client: s[k].client,
            event: s[k].status,
            id: null,
            instance: s[k].instance,
          }),
          (e?: Error) => {
            console.error('WS send error:', e);
          },
        );
      }
    }
  }

  // ws 8 no longer decodes text frames before handing them to the 'message'
  // listener: the payload always arrives as raw data (a Buffer here), and a
  // second `isBinary` argument says which kind of frame it came from. Under
  // ws 7 a text frame arrived as a string, so the old `typeof msg !== 'string'`
  // guard rejected *every* inbound multiplayer message the moment ws was
  // upgraded. The unit tests drive a mocked socket and so cannot see this;
  // 'rejects binary frames' / 'accepts text frames' in Handlers.test.ts cover
  // it now.
  ws.on('message', (data: WebSocket.RawData, isBinary: boolean) => {
    // A superseded socket may still deliver queued frames while its close handshake finishes.
    const current = (getSession(params.session) || {})[
      toClientKey(params.client, params.instance)
    ];
    if (!current || current.socket !== ws) {
      return;
    }
    if (isBinary) {
      sendError(ws, 'Invalid type for inbound message: binary');
      return;
    }
    const msg = data.toString();

    let event: MultiplayerEvent;
    try {
      event = JSON.parse(msg);
    } catch (e) {
      sendError(
        ws,
        'Could not parse inbound event starting with: ' + msg.substr(0, 32),
      );
      return;
    }

    if (!event || !event.event || !event.event.type) {
      sendError(
        ws,
        'No parsed type for event starting with: ' + msg.substr(0, 32),
      );
      return;
    }

    if (event.client !== params.client || event.instance !== params.instance) {
      sendError(ws, 'Event identity does not match authenticated socket');
      return;
    }
    // Replay and inflight decisions originate at the server, never another peer.
    if (!['ACTION', 'STATUS', 'INTERACTION'].includes(event.event.type)) {
      sendError(ws, 'Unsupported client event type');
      return;
    }
    if (event.event.type !== 'ACTION' && event.id !== null) {
      sendError(ws, 'Non-ACTION events must have a null ID');
      return;
    }
    if (event.event.type === 'ACTION') {
      if (
        typeof event.event.name !== 'string' ||
        !event.event.name ||
        typeof event.event.args !== 'string'
      ) {
        sendError(ws, 'Invalid ACTION name or arguments');
        return;
      }
      try {
        JSON.parse(event.event.args);
      } catch (e) {
        sendError(ws, 'Invalid ACTION JSON arguments');
        return;
      }
    }
    if (
      event.event.type === 'STATUS' &&
      event.event.lastEventID !== undefined &&
      (!Number.isSafeInteger(event.event.lastEventID) ||
        event.event.lastEventID < 0)
    ) {
      sendError(ws, 'Invalid STATUS lastEventID');
      return;
    }
    if (event.event.type === 'STATUS') {
      const status = event.event;
      const waiting = status.waitingOn;
      const malformed =
        (status.connected !== undefined &&
          typeof status.connected !== 'boolean') ||
        (status.name !== undefined && typeof status.name !== 'string') ||
        (['line', 'numLocalPlayers', 'aliveAdventurers'] as const).some(
          key =>
            status[key] !== undefined &&
            (!Number.isSafeInteger(status[key]) ||
              status[key] < (key === 'line' ? -1 : 0)),
        ) ||
        (status.contentSets !== undefined &&
          (!Array.isArray(status.contentSets) ||
            status.contentSets.some(set => typeof set !== 'string'))) ||
        (waiting !== undefined &&
          waiting !== null &&
          (!waiting ||
            typeof waiting !== 'object' ||
            typeof waiting.type !== 'string' ||
            (waiting.type === 'TIMER' &&
              (!Number.isFinite(waiting.elapsedMillis) ||
                waiting.elapsedMillis < 0))));
      if (malformed) {
        sendError(ws, 'Invalid STATUS fields');
        return;
      }
    }
    // If it's not a transactioned action, just broadcast it.
    if (event.event.type !== 'ACTION') {
      broadcast(params.session, msg);
      if (event.event.type === 'STATUS') {
        handleClientStatus(
          db,
          params.session,
          event.client,
          event.instance,
          event.event,
          ws,
        );
      }
      return;
    }

    // Precondition: event is an ACTION
    const eventID = event.id;
    if (eventID === null || !Number.isSafeInteger(eventID) || eventID < 1) {
      sendError(ws, 'Received ACTION event with invalid ID');
      return;
    }

    commitEvent(
      db,
      params.session,
      params.client,
      params.instance,
      eventID,
      event.event.type,
      msg,
    )
      .then((result: number | null) => {
        broadcast(params.session, msg);
      })
      .catch((error: Error) => {
        console.error('WS commit error:', error);
        // Include the contested ID, which is needed to reconcile the losing action.
        return makeMultiEvent(db, params.session, eventID - 1)
          .then(event => {
            if (event) {
              sendSocketMessage(ws, {
                client: 'SERVER',
                event,
                id: null,
                instance: Config.get('NODE_ENV'),
              });
            }
          })
          .catch((e: Error) => sendError(ws, e.toString()));
      });
  });

  ws.on('close', () => {
    const current = (getSession(params.session) || {})[
      toClientKey(params.client, params.instance)
    ];
    if (!current || current.socket !== ws) {
      return;
    }
    rmSessionClient(params.session, params.client, params.instance);

    // Notify other clients this client has disconnected
    broadcast(
      params.session,
      JSON.stringify({
        client: params.client,
        event: {
          connected: false,
          type: 'STATUS',
        },
        id: null,
        instance: params.instance,
      }),
    );
  });
}

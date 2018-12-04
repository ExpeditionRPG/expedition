import * as http from 'http';
import {MultiplayerEvent} from 'shared/multiplayer/Events';
import * as WebSocket from 'ws';
import Config from '../config';
import {Database} from '../models/Database';
import {verifyWebsocket, websocketSession} from './Handlers';
import {getSession} from './Sessions';

export function setupWebsockets(db: Database, server: any) {
  const wss = new WebSocket.Server({
    server,
    verifyClient: (info: any, cb: (verified: boolean) => any) => {
      verifyWebsocket(db, info, cb);
    },
  });

  wss.on('error', (err) => {
    console.error('Caught WSS error: ');
    console.error(err.stack);
  });

  wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
    ws.on('error', (e: Error) => console.error(e));
    websocketSession(db, ws, req);
  });
}

export function broadcast(session: number, msg: string) {
  const s = getSession(session);
  if (!s) {
    return;
  }
  for (const peerID of Object.keys(s)) {
    const peerWS = s[peerID] && s[peerID].socket;
    if (peerWS && peerWS.readyState === WebSocket.OPEN) {
      peerWS.send(msg, (e: Error) => {
        console.error(e);
      });
    }
  }
}

export function broadcastError(session: number, error: Error) {
  broadcast(session, JSON.stringify({
    client: 'SERVER',
    event: {
      error: 'Server error: ' + error.toString(),
      type: 'ERROR',
    },
    id: null,
    instance: Config.get('NODE_ENV'),
  } as MultiplayerEvent));
}

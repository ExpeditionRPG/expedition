import * as http from 'http';
import * as WebSocket from 'ws';
import {Database} from '../models/Database';
import {verifyWebsocket, websocketSession} from './Handlers';

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

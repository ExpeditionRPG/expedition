import * as WebSocket from 'ws'
import * as http from 'http'
import {verifyWebsocket, websocketSession} from './Handlers'
import {Database} from '../models/Database'

export function setupWebsockets(db: Database, server: any) {
  const wss = new WebSocket.Server({
    server,
    verifyClient: (info: any, cb: (verified: boolean)=>any) => {
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

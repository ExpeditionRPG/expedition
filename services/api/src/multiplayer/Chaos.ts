// Wrappers that simulate degraded network performance, bugs in code, and fuzzed packets
import * as WebSocket from 'ws';
import Config from '../config';
import {Database} from '../models/Database';
import {commitEvent, getLargestEventID} from '../models/multiplayer/Events';

const CHAOS_FUZZ_LENGTH = 80;
const CHAOS_REPLAY_BUF_LENGTH = 10;
const CHAOS_MAX_DELAY = 2000;
const CHAOS_INTERVAL = 2000;

function fuzzMessage(): string {
  const fuzzChars = '{}()":abcdefghijklmnopqrstuvwxyz0123456789';
  const r = Math.random() * CHAOS_FUZZ_LENGTH;
  let result = '';
  for (let i = 0; i < r; i++) {
    result += fuzzChars[Math.floor(Math.random() * fuzzChars.length)];
  }
  return result;
}

export function chaosWS(ws: WebSocket): WebSocket {
  console.log('CHAOS: wrapping websocket');

  const oldMessageBuf: string[] = [];
  const oldSend = ws.send.bind(ws);

  // Replacement conflicts with polymorphic send() function, so we
  // cast to any here.
  (ws as any).send = (s: string, errCallback?: (err: Error) => void) => {
    // Keep a running buffer of messages for later replay
    oldMessageBuf.push(s);
    while (oldMessageBuf.length > CHAOS_REPLAY_BUF_LENGTH) {
      oldMessageBuf.shift();
    }

    if (Math.random() <= (parseFloat(Config.get('CHAOS_FRACTION')) || 0)) {
      oldSend(s, errCallback);
      return;
    }

    if (Math.random() < 0.4) {
      // Randomly drop outbound messages
      console.log('CHAOS: dropping outbound message ' + s.substr(0, 128));
      return;
    } else {
      // Randomly delay outbound messages
      const delay = Math.floor(CHAOS_MAX_DELAY * Math.random());
      console.log('CHAOS: delaying outbound message by ' + delay + 'ms');
      setTimeout(() => {oldSend(s, errCallback); }, delay);
    }
  };

  const chaosInterval = setInterval(() => {
    if (ws.readyState !== WebSocket.OPEN) {
      console.log('CHAOS: stopping interval');
      clearInterval(chaosInterval);
      return;
    }

    if (Math.random() >= (parseFloat(Config.get('CHAOS_FRACTION')) || 0)) {
      return;
    }

    const r = Math.random();
    if (r < 0.05) {
      console.log('CHAOS: closing socket!');
      ws.close();
    } else if (r < 0.5) {
      // Send fuzz to server
      const fuzzmsg = fuzzMessage();
      console.log('CHAOS: fuzzing ws message to server: ' + fuzzmsg);

      (ws as any)._receiver.onmessage(fuzzmsg); // {data: fuzzmsg, type: 'test', target: ws});

    } else if (oldMessageBuf.length > 0) {
      // Send replay to client
      const replaymsg = oldMessageBuf[Math.floor(Math.random() * oldMessageBuf.length)];
      console.log('CHAOS: replaying msg to client: ' + replaymsg.substr(0, 128));
      oldSend(replaymsg, (e: Error) => {console.error(e); });
    }
  }, CHAOS_INTERVAL);
  return ws;
}

export function chaosDB(db: Database, session: number, ws: WebSocket): Database {
  console.log('CHAOS: setting up chaos Database');

  // Randomly injects events (results in conflicts in commitEvent)
  const chaosInterval = setInterval(() => {
    if (ws.readyState !== WebSocket.OPEN) {
      console.log('CHAOS: stopping interval');
      clearInterval(chaosInterval);
      return;
    }

    if (Math.random() < (parseFloat(Config.get('CHAOS_FRACTION')) || 0)) {
      console.log('CHAOS: injecting an id\'d event');
      getLargestEventID(db, session).then((latestID) => {
        commitEvent(db, session, 'chaos', 'chaos', latestID + 1, 'CHAOS', JSON.stringify({id: latestID + 1, event: {type: 'chaos!'}}));
      });
    }
  }, CHAOS_INTERVAL);

  /*
  console.log('CHAOS: wrapping SessionClientModel');

  // Randomly fail to verify user membership in a session
  const oldVerify = sc.verify.bind(sc);
  sc.verify = (session: number, client: string, secret: string) => {
    if (Math.random() < (parseFloat(Config.get('CHAOS_FRACTION')) || 0)) {
      console.log('CHAOS: failing session client check');
      return Bluebird.resolve(false);
    }
    return oldVerify(session, client, secret);
  }
  */

  return db;
}

export function maybeChaosWS(ws: WebSocket): WebSocket {
  if (Config.get('NODE_ENV') !== 'production' && Config.get('MULTIPLAYER_CHAOS') === 'true') {
    return chaosWS(ws);
  }
  return ws;
}

export function maybeChaosDB(db: Database, session: number, ws: WebSocket): Database {
  if (Config.get('NODE_ENV') !== 'production' && Config.get('MULTIPLAYER_CHAOS') === 'true') {
    return chaosDB(db, session, ws);
  }
  return db;
}

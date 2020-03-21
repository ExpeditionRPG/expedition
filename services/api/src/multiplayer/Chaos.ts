// Wrappers that simulate degraded network performance, bugs in code, and fuzzed packets
import * as WebSocket from 'ws';
import Config from '../config';
import { Database } from '../models/Database';
import { commitEvent, getLargestEventID } from '../models/multiplayer/Events';

const LOGPRE = '>>>>> CHAOS: ';
const CHAOS_FRACTION_FIELD = 'CHAOS_FRACTION';
const CHAOS_FIELD = 'CHAOS';
enum ChaosParam {
  replay = 'CHAOS_REPLAY',
  close = 'CHAOS_CLOSE_SOCKET',
  fuzz = 'CHAOS_FUZZ_SOCKET',
  inject = 'CHAOS_INJECT_DB',
  drop = 'CHAOS_DROP_MESSAGE',
  delay = 'CHAOS_DELAY_MESSAGE',
}
function enabled(p: ChaosParam): boolean {
  return (Config.get(CHAOS_FIELD) || []).indexOf(p) !== -1;
}

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

    if (Math.random() <= (parseFloat(Config.get(CHAOS_FRACTION_FIELD)) || 0)) {
      oldSend(s, errCallback);
      return;
    }

    if (enabled(ChaosParam.drop) && Math.random() < 0.4) {
      // Randomly drop outbound messages
      console.warn(LOGPRE + 'dropping outbound message ' + s.substr(0, 128));
      return;
    } else if (enabled(ChaosParam.delay)) {
      // Randomly delay outbound messages
      const delay = Math.floor(CHAOS_MAX_DELAY * Math.random());
      console.warn(LOGPRE + 'delaying outbound message by ' + delay + 'ms');
      setTimeout(() => {
        oldSend(s, errCallback);
      }, delay);
    }
  };

  const chaosInterval = setInterval(() => {
    if (ws.readyState !== WebSocket.OPEN) {
      console.warn(LOGPRE + 'stopping interval');
      clearInterval(chaosInterval);
      return;
    }

    if (Math.random() >= (parseFloat(Config.get(CHAOS_FRACTION_FIELD)) || 0)) {
      return;
    }

    const r = Math.random();
    if (enabled(ChaosParam.close) && r < 0.05) {
      console.log(LOGPRE + 'closing socket!');
      ws.close();
    } else if (enabled(ChaosParam.fuzz) && r < 0.5) {
      // Send fuzz to server
      const fuzzmsg = fuzzMessage();
      console.warn(LOGPRE + 'fuzzing ws message to server: ' + fuzzmsg);
      (ws as any)._receiver.onmessage(fuzzmsg); // {data: fuzzmsg, type: 'test', target: ws});
    } else if (enabled(ChaosParam.replay) && oldMessageBuf.length > 0) {
      // Send replay to client
      const replaymsg =
        oldMessageBuf[Math.floor(Math.random() * oldMessageBuf.length)];
      console.warn(
        LOGPRE + 'replaying msg to client: ' + replaymsg.substr(0, 128)
      );
      oldSend(replaymsg, (e: Error) => {
        console.error(e);
      });
    }
  }, CHAOS_INTERVAL);
  return ws;
}

export function chaosDB(
  db: Database,
  session: number,
  ws: WebSocket
): Database {
  // Randomly injects events (results in conflicts in commitEvent)
  const chaosInterval = setInterval(() => {
    if (ws.readyState !== WebSocket.OPEN) {
      console.log(LOGPRE + 'stopping interval');
      clearInterval(chaosInterval);
      return;
    }

    if (
      enabled(ChaosParam.inject) &&
      Math.random() < (parseFloat(Config.get(CHAOS_FRACTION_FIELD)) || 0)
    ) {
      console.log(LOGPRE + 'injecting an id\'d event');
      getLargestEventID(db, session).then((latestID) => {
        commitEvent(
          db,
          session,
          'chaos',
          'chaos',
          latestID + 1,
          'CHAOS',
          JSON.stringify({ id: latestID + 1, event: { type: 'chaos!' } })
        );
      });
    }
  }, CHAOS_INTERVAL);
  return db;
}

export function maybeChaosWS(ws: WebSocket): WebSocket {
  if (Config.get('NODE_ENV') !== 'production' && Config.get(CHAOS_FIELD)) {
    console.warn(' ================== WARNING ================== ');
    console.warn('            WEBSOCKET CHAOS ENABLED            ');
    console.warn(Config.get(CHAOS_FIELD));
    console.warn(' ============================================= ');
    return chaosWS(ws);
  }
  return ws;
}

export function maybeChaosDB(
  db: Database,
  session: number,
  ws: WebSocket
): Database {
  if (Config.get('NODE_ENV') !== 'production' && Config.get(CHAOS_FIELD)) {
    console.warn(' ================== WARNING ================== ');
    console.warn('            DATABASE CHAOS ENABLED             ');
    console.warn(Config.get(CHAOS_FIELD));
    console.warn(' ============================================= ');
    return chaosDB(db, session, ws);
  }
  return db;
}

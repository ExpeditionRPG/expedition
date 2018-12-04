import * as Promise from 'bluebird';
import {ActionEvent, ClientID, TimerWait, WaitType} from 'shared/multiplayer/Events';
import {Database} from '../models/Database';
import {commitAndBroadcastAction} from '../models/multiplayer/Events';
import {getSession} from './Sessions';
import {broadcastError} from './Websockets';

function allWaitingOn(session: number, type: string, map?: (w: WaitType) => any): boolean {
  let waitCount: number = 0;
  const s = getSession(session) || {};
  for (const c of Object.keys(s)) {
    const sc = s[c];
    if (!sc || sc.status === null) {
      continue;
    }

    const wo: WaitType|undefined = sc.status.waitingOn;
    if (!wo || wo.type !== type) {
      continue;
    }

    waitCount += 1;
    if (map) {
      map(wo);
    }
  }
  return waitCount === Object.keys(s).length;
}

export function handleWaitingOnTimer(db: Database, session: number, client: ClientID, instance: string, commitAndBroadcast= commitAndBroadcastAction): Promise<void> {
  let maxElapsedMillis = 0;
  const allWaiting = allWaitingOn(session, 'TIMER', (w) => {
    maxElapsedMillis = Math.max(maxElapsedMillis, (w as TimerWait).elapsedMillis);
  });

  // Do nothing if not everyone is waiting for timer resolution
  if (!allWaiting) {
    return Promise.resolve();
  }

  return commitAndBroadcast(db, session, client, instance, {
      args: JSON.stringify({elapsedMillis: maxElapsedMillis, seed: Date.now()}),
      name: 'handleCombatTimerStop',
      type: 'ACTION',
    } as ActionEvent)
    .catch((error: Error) => broadcastError(session, error));
}

export function handleWaitingOnReview(db: Database, session: number, client: ClientID, instance: string, commitAndBroadcast= commitAndBroadcastAction): Promise<void> {
  // Do nothing if not everyone is waiting for review resolution
  if (!allWaitingOn(session, 'REVIEW')) {
    return Promise.resolve();
  }

  return commitAndBroadcast(db, session, client, instance, {
      args: JSON.stringify({skip: [{name: 'QUEST_CARD'}, {name: 'QUEST_SETUP'}]}),
      name: 'toPrevious',
      type: 'ACTION',
    } as ActionEvent)
    .then(() => commitAndBroadcast(db, session, client, instance, {
      args: JSON.stringify({}),
      name: 'exitQuest',
      type: 'ACTION',
    } as ActionEvent))
    .catch((error: Error) => broadcastError(session, error));
}

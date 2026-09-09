import { ClientID, TimerWait, WaitType } from 'shared/multiplayer/Events';
import { Database } from '../models/Database';
import { commitAndBroadcastAction } from '../models/multiplayer/Events';
import { getSession, InMemorySession } from './Sessions';
import { broadcastError } from './Websockets';

// Key by the session object so resetSessions naturally discards old latches.
// Replacing a socket leaves that object intact: retransmitted readiness after
// reconnect must not resolve the same combat round or review a second time.
const resolutions = new WeakMap<InMemorySession, Map<string, number>>();

function beginResolution(session: number, type: string): (() => void) | null {
  const state = getSession(session);
  if (!state) {
    return null;
  }
  const epochs = Object.values(state).map(
    c => c.status && c.status.lastEventID,
  );
  const known = epochs.filter((id): id is number => typeof id === 'number');
  // Do not combine readiness from two different committed rounds.
  if (known.some(id => id !== known[0])) {
    return null;
  }
  const epoch = known.length ? known[0] : -1;
  let resolved = resolutions.get(state);
  if (!resolved) {
    resolved = new Map();
    resolutions.set(state, resolved);
  }
  const last = resolved.get(type);
  if (last !== undefined && epoch <= last) {
    return null;
  }
  resolved.set(type, epoch);
  return () => {
    if (resolved && resolved.get(type) === epoch) {
      resolved.delete(type);
    }
  };
}

function allWaitingOn(
  session: number,
  type: string,
  map?: (w: WaitType) => any,
): boolean {
  let waitCount: number = 0;
  const s = getSession(session) || {};
  for (const c of Object.keys(s)) {
    const sc = s[c];
    if (!sc || sc.status === null) {
      continue;
    }

    const wo: WaitType | undefined = sc.status.waitingOn;
    if (!wo || wo.type !== type) {
      continue;
    }

    waitCount += 1;
    if (map) {
      map(wo);
    }
  }
  const allWaiting =
    Object.keys(s).length > 0 && waitCount === Object.keys(s).length;
  if (
    !allWaiting &&
    Object.values(s).every(c => !c.status || c.status.lastEventID === undefined)
  ) {
    // Older clients omit the epoch. Their explicit leave/reenter-wait transition
    // is the only available signal that a new resolution may begin.
    resolutions.get(s)?.delete(type);
  }
  return allWaiting;
}

export function handleWaitingOnTimer(
  db: Database,
  session: number,
  client: ClientID,
  instance: string,
  commitAndBroadcast = commitAndBroadcastAction,
): Promise<void> {
  let maxElapsedMillis = 0;
  const allWaiting = allWaitingOn(session, 'TIMER', w => {
    maxElapsedMillis = Math.max(
      maxElapsedMillis,
      (w as TimerWait).elapsedMillis,
    );
  });

  // Do nothing if not everyone is waiting for timer resolution
  if (!allWaiting) {
    return Promise.resolve();
  }

  const release = beginResolution(session, 'TIMER');
  if (!release) {
    return Promise.resolve();
  }
  return commitAndBroadcast(db, session, client, instance, {
    args: JSON.stringify({ elapsedMillis: maxElapsedMillis, seed: Date.now() }),
    name: 'handleCombatTimerStop',
    type: 'ACTION',
  }).catch((error: Error) => {
    release();
    broadcastError(session, error);
  });
}

export function handleWaitingOnReview(
  db: Database,
  session: number,
  client: ClientID,
  instance: string,
  commitAndBroadcast = commitAndBroadcastAction,
): Promise<void> {
  // Do nothing if not everyone is waiting for review resolution
  if (!allWaitingOn(session, 'REVIEW')) {
    return Promise.resolve();
  }

  const release = beginResolution(session, 'REVIEW');
  if (!release) {
    return Promise.resolve();
  }
  return commitAndBroadcast(db, session, client, instance, {
    args: JSON.stringify({
      skip: [{ name: 'QUEST_CARD' }, { name: 'QUEST_SETUP' }],
    }),
    name: 'toPrevious',
    type: 'ACTION',
  })
    .then(() =>
      commitAndBroadcast(db, session, client, instance, {
        args: JSON.stringify({}),
        name: 'exitQuest',
        type: 'ACTION',
      }),
    )
    .catch((error: Error) => {
      release();
      broadcastError(session, error);
    });
}

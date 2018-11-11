
export interface MultiplayerCounters {
  [field: string]: number;
  compactionEvents: number;
  disconnectCount: number;
  errorEvents: number;
  failedTransactions: number;
  receivedEvents: number;
  reconnectCount: number;
  sessionCount: number;
  successfulTransactions: number;
  syncs: number;
}

export const initialMultiplayerCounters: MultiplayerCounters = {
  compactionEvents: 0,
  disconnectCount: 0,
  errorEvents: 0,
  failedTransactions: 0,
  receivedEvents: 0,
  reconnectCount: 0,
  sessionCount: 0,
  successfulTransactions: 0,
  syncs: 0,
};

let stats: MultiplayerCounters = {...initialMultiplayerCounters};

export function counterAdd(name: keyof MultiplayerCounters, delta: number) {
  stats[name] += delta;
}

export function resetCounters() {
  stats = {...initialMultiplayerCounters};
}

export function getCounters(): MultiplayerCounters {
  return {...stats};
}

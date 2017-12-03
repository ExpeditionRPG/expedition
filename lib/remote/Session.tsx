import {RemotePlayEvent, ClientID} from './Events'

export type SessionID = number;
export type SessionSecret = string; // 4-character entry code
export type SessionLock = Date;

export interface Session {
  secret?: SessionSecret;
  id?: SessionID;
  lock?: SessionLock;
  created?: number;
}

export interface SessionMetadata {
  id: SessionID;
  peerCount?: number;
  questTitle?: string;
  lastAction?: number;
}

export function makeSecret(): SessionSecret {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (var i = 0; i < 4; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

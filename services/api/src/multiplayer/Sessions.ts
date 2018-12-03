import {StatusEvent} from 'shared/multiplayer/Events';
import {toClientKey} from 'shared/multiplayer/Session';
import * as WebSocket from 'ws';

export interface SessionClient {socket: WebSocket, status: StatusEvent|null, client: string, instance: string}

export interface InMemorySession {[clientAndInstance: string]: SessionClient}

let inMemorySessions: {[session: number]: InMemorySession} = {};

export function getSession(session: number): InMemorySession|null {
  return inMemorySessions[session] || null;
}

export function initSessionClient(session: number, client: string, instance: string, socket: WebSocket): SessionClient {
  if (!inMemorySessions[session]) {
    inMemorySessions[session] = {};
  }
  inMemorySessions[session][toClientKey(client, instance)] = {
    client,
    instance,
    socket,
    status: null,
  };
  return inMemorySessions[session][toClientKey(client, instance)];
}

export function setClientStatus(session: number, client: string, instance: string, socket: WebSocket, status: StatusEvent): SessionClient {
  if (!inMemorySessions[session]) {
    inMemorySessions[session] = {};
  }
  const s = getSession(session);
  if (!s || !s[toClientKey(client, instance)]) {
    initSessionClient(session, client, instance, socket);
  }
  const cli = (s || {})[toClientKey(client, instance)];
  cli.status = status;
  return cli;
}

export function rmSessionClient(session: number, client: string, instance: string) {
  if (!(getSession(session) || {})[toClientKey(client, instance)]) {
    return;
  }
  delete inMemorySessions[session][toClientKey(client, instance)];
}

export function resetSessions() {
  inMemorySessions = {};
}

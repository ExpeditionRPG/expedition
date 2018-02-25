import {RemotePlayEvent, ClientID, InstanceID} from './Events'

export type SessionID = number;

export function makeSecret(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (var i = 0; i < 4; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Devices are uniquely identified by the logged in user ID and
// by an instance number. In order to use these in a simple map,
// they are concatenated with a separating pipe '|'
export function toClientKey(client: ClientID, instance: InstanceID) {
  return client+'|'+instance;
}
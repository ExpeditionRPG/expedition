
/*
ERROR {code: number, message: string}
TOUCH {positions: number[][]}
STATUS {line: number, waiting?: boolean}
CARD <serialized card state>
*/

// ------ Primitives passed in Events ---------

export type ClientID = string;

// Array of [vw, vh] coordinates, e.g. [[1,2], [3,4]].
export type TouchList = number[][];

export interface ClientStatus {
  line: number;
  waiting?: boolean;
}

// ------ Events from Client to Client --------

export interface EventBase {
  client: ClientID;
}

export interface StatusEvent extends EventBase {
  type: 'STATUS';
  status: ClientStatus;
}

export interface TouchEvent extends EventBase {
  type: 'TOUCH';
  positions: TouchList;
}

export interface CardEvent extends EventBase {
  type: 'CARD';
  card: string; // Serialized card state
}

export interface NavEvent extends EventBase {
  type: 'NAV';
  state: any; // TODO SERIALIZED CARD STATE
}

export interface ErrorEvent extends EventBase {
  type: 'ERROR';
  error: string;
}

export interface SettingsEvent extends EventBase {
  type: 'SETTING';
  key: string;
  value: string;
}

export type RemotePlayEvent = StatusEvent|TouchEvent|CardEvent|NavEvent|ErrorEvent|SettingsEvent;

export type MessageType = 'STATUS'|'TOUCH'|'CARD'|'NAV'|'ERROR'|'SETTING';

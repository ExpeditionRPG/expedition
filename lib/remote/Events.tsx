
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

export interface ActionEvent extends EventBase {
  type: 'ACTION';
  // Redux action, compressed & serialized to JSON.
  // It's up to the client implementation to determine
  // what (if anything) to do with the action.
  action: string;
}

export interface ErrorEvent extends EventBase {
  type: 'ERROR';
  error: string;
}

export type RemotePlayEvent = StatusEvent|TouchEvent|ErrorEvent|ActionEvent;

export type MessageType = 'STATUS'|'TOUCH'|'ACTION'|'ERROR';

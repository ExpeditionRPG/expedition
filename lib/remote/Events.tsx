
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

export interface StatusEvent {
  type: 'STATUS';
  status: ClientStatus;
}

export interface TouchEvent {
  type: 'TOUCH';
  positions: TouchList;
}

export interface ActionEvent {
  type: 'ACTION';
  // Redux action, compressed & serialized to JSON.
  // It's up to the client implementation to determine
  // what (if anything) to do with the action.
  action: string;
}

export interface ErrorEvent {
  type: 'ERROR';
  error: string;
}

export type RemotePlayEventBody = StatusEvent|TouchEvent|ErrorEvent|ActionEvent;

export interface RemotePlayEvent {
  client: ClientID;
  event: RemotePlayEventBody;
}

export type MessageType = 'STATUS'|'TOUCH'|'ACTION'|'ERROR';

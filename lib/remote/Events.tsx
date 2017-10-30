
/*
ERROR {code: number, message: string}
TOUCH {positions: number[][]}
STATUS {line: number, waiting?: boolean}
CARD <serialized card state>
*/

// ------ Primitives passed in Events ---------

export type ClientID = string;

// Array of [vw, vh] coordinates keyed by ID, e.g. {0: [1,2], 1: [3,4]}.
export type TouchList = {[id: string]: number[]};

export interface ClientStatus {
  line: number;
  waiting?: boolean;
}

// ------ Events from Client to Client --------

export interface StatusEvent {
  type: 'STATUS';
  status: ClientStatus;
}

// Interaction events indicate what remote clients are doing,
// without significantly affecting the state of the app.
// This includes button taps and finger placement on the
// combat timer.
export interface InteractionEvent {
  type: 'INTERACTION';
  id: string; // unique ID for the UI element
  event: string; // "touchstart", etc
  positions: TouchList; // 0-1000 relative positioning from top left of UI element.
}

// Action events invoke registered action functions on remote clients when they are broadcast.
export interface ActionEvent {
  type: 'ACTION';
  name: string;
  args: string;
}

export interface ErrorEvent {
  type: 'ERROR';
  error: string;
}

export type RemotePlayEventBody = StatusEvent|InteractionEvent|ErrorEvent|ActionEvent;

export interface RemotePlayEvent {
  client: ClientID;
  event: RemotePlayEventBody;
}

export type MessageType = 'STATUS'|'TOUCH'|'ACTION'|'ERROR';

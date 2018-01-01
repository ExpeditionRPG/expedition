// ------ Primitives Passed in Events ---------

// This maps to an authenticated user.
export type ClientID = string;

// A user may have multiple devices authenticated with the same ClientID.
// The InstanceID is unique per-device owned by the user. Combined with
// the ClientID, it uniquely identifies a device.
export type InstanceID = string;

// Array of [vw, vh] coordinates keyed by ID, e.g. {0: [1,2], 1: [3,4]}.
// The object structure is influenced by Cloud Firestore restrictions on nested arrays.
export type TouchList = {[id: string]: number[]};

// ------ Events (Passed Client-to-Client) --------

// StatusEvent is published by a client to indicate some change in state.
export type WaitType = {type: 'TIMER', elapsedMillis: number};
export interface StatusEvent {
  type: 'STATUS';

  // The line of the quest the client is currently synced to, if any.
  line?: number;

  // Whether or not the client is waiting for action by other clients.
  // For example, this could be set to 'LOBBY' to indicate the client is
  // ready to leave a remote play lobby page.
  waitingOn?: WaitType;

  // Whether the client is connected or not.
  connected?: boolean;

  // Count of players playing on this client - used for e.g. damage calculation
  numPlayers?: number;
}

// Interaction events indicate what remote clients are doing,
// without significantly affecting the state of the app.
// This includes button taps and finger placement on the
// combat timer.
export interface InteractionEvent {
  type: 'INTERACTION';

  // unique ID for the UI element
  id: string;

  // "touchstart", etc
  event: string;

  // 0-1000 relative positioning from top left of the UI element.
  positions: TouchList;
}

// Action events invoke registered action functions on remote clients when they are broadcast.
export interface ActionEvent {
  type: 'ACTION';

  // The name of the action. The client uses this to determine what action to perform.
  // Example: https://github.com/ExpeditionRPG/expedition-app/blob/1d9a123598d6b119157e394b28bc1e6c9633f1c6/app/actions/ActionTypes.tsx#L133
  name: string;

  // JSON string of arguments to pass to the action.
  args: string;
}

export interface ErrorEvent {
  type: 'ERROR';
  error: string;
}

export interface InflightCommitEvent {
  type: 'INFLIGHT_COMMIT';
}

export interface InflightRejectEvent {
  type: 'INFLIGHT_REJECT';
  error: string;
}

export type RemotePlayEventBody = StatusEvent|InteractionEvent|ErrorEvent|ActionEvent|InflightCommitEvent|InflightRejectEvent;
export interface RemotePlayEvent {
  client: ClientID;
  instance: InstanceID;
  event: RemotePlayEventBody;
  id: number|null; // Monotonically increasing, unique to a single event per session
}

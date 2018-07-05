// ------ Primitives Passed in Events ---------

// This maps to an authenticated user.
export type ClientID = string;

// A user may have multiple devices authenticated with the same ClientID.
// The InstanceID is unique per-device owned by the user. Combined with
// the ClientID, it uniquely identifies a device.
export type InstanceID = string;

// Array of [vw, vh] coordinates keyed by ID, e.g. {0: [1,2], 1: [3,4]}.
// The object structure is influenced by Cloud Firestore restrictions on nested arrays.
export interface TouchList {[id: string]: number[]; }

// ------ Events (Passed Client-to-Client) --------

// StatusEvent is published by a client to indicate some change in state.
export interface WaitType {type: 'TIMER'; elapsedMillis: number; }
export interface StatusEvent {
  type: 'STATUS';

  // The line of the quest the client is currently synced to, if any.
  line?: number;

  // Whether or not the client is waiting for action by other clients.
  // For example, this could be set to 'LOBBY' to indicate the client is
  // ready to leave a multiplayer play lobby page.
  waitingOn?: WaitType;

  // Whether the client is connected or not.
  connected?: boolean;

  // Count of players playing on this client - used for e.g. damage calculation
  numPlayers?: number;

  // The last seen event ID from the client. This is used to keep
  // the client in sync.
  lastEventID?: number;
}

// Interaction events indicate what multiplayer clients are doing,
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

// Action events invoke registered action functions on multiplayer clients when they are broadcast.
export interface ActionEvent {
  type: 'ACTION';

  // The name of the action. The client uses this to determine what action to perform. Example:
  // https://github.com/ExpeditionRPG/expedition-app/blob/1d9a123598d6b119157e394b28bc1e6c9633f1c6/app/actions/ActionTypes.tsx#L133
  name: string;

  // JSON string of arguments to pass to the action.
  args: string;
}

// MultiAction events allow fast-forwarding of clients without having to send individual packets.
// The .actions parameter must contain actions in event ID order, earliest to latest.
export interface MultiEvent {
  type: 'MULTI_EVENT';
  events: string[];
  lastId: number;
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

  // A list of one or more events that conflict with the inflight event.
  // This may not be all events up to the most recent one, due to query
  // limits and potential transactions occuring as this event is sent out.
  conflicts: MultiEvent|null;
}

export type MultiplayerEventBody = StatusEvent|InteractionEvent|ErrorEvent|ActionEvent|MultiEvent|InflightCommitEvent|InflightRejectEvent;
export interface MultiplayerEvent {
  client: ClientID;
  instance: InstanceID;
  event: MultiplayerEventBody;
  id: number|null; // Monotonically increasing, unique to a single event per session
}

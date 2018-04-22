import Redux from 'redux'
import {
  CardState,
  CardName,
  CardPhase,
  CheckoutState,
  DialogIDType,
  SearchPhase,
  SearchSettings,
  SettingsType,
  TransitionType,
  UserState,
  AppState,
  MultiplayerSessionMeta,
  SavedQuestMeta,
} from '../reducers/StateTypes'
import {QuestDetails} from '../reducers/QuestTypes'
import {ParserNode} from '../cardtemplates/TemplateTypes'
import {ClientID, InstanceID, StatusEvent} from 'expedition-qdl/lib/multiplayer/Events'

export interface FetchAnnouncementResponse {
  message: string;
  link: string;
  versions: {
    android: string;
    ios: string;
    web: string;
  };
}

export interface PushHistoryAction extends Redux.Action {
  type: 'PUSH_HISTORY';
}

export interface AnnouncementSetAction extends Redux.Action {
  type: 'ANNOUNCEMENT_SET';
  open: boolean;
  message?: string;
  link?: string;
}

export interface AudioSetAction extends Redux.Action {
  type: 'AUDIO_SET';
  changes: any;
}

export interface AudioStoreBufferAction extends Redux.Action {
  type: 'AUDIO_STORE_BUFFER';
  name: string;
  buffer: AudioBuffer;
}

export interface CardTransitioningAction extends Redux.Action {
  type: 'CARD_TRANSITIONING';
  isTransitioning: boolean;
}

export interface CheckoutSetStateAction extends Redux.Action, CheckoutState {
  type: 'CHECKOUT_SET_STATE';
}

export interface DialogSetAction extends Redux.Action {
  type: 'DIALOG_SET';
  dialogID: DialogIDType;
  message?: string;
}

export interface NavigateAction extends Redux.Action {
  type: 'NAVIGATE';
  to: CardState;
  dontUpdateUrl: boolean;
};

export interface ReturnAction extends Redux.Action {
  type: 'RETURN';
  to: CardState;
  before: boolean;
  skip?: {name: CardName, phase: CardPhase}[]; // Skip any occurrences of these cards
};

export interface QuestNodeAction extends Redux.Action {
  type: 'QUEST_NODE';
  node: ParserNode;
  details?: QuestDetails;
}

export interface ChangeSettingsAction extends Redux.Action {
  type: 'CHANGE_SETTINGS';
  settings: any;
}

export interface CombatTimerStopAction extends Redux.Action {
  type: 'COMBAT_TIMER_STOP';
  elapsedMillis: number;
  settings: SettingsType;
}

export interface UserFeedbackChangeAction extends Redux.Action {
  type: 'USER_FEEDBACK_CHANGE';
  userFeedback: any;
}

export interface UserFeedbackClearAction extends Redux.Action {
  type: 'USER_FEEDBACK_CLEAR';
}

export interface SearchRequestAction extends Redux.Action {
  type: 'SEARCH_REQUEST';
}

export interface SearchResponseAction extends Redux.Action {
  type: 'SEARCH_RESPONSE';
  quests: QuestDetails[];
  nextToken: string;
  receivedAt: number;
  search: SearchSettings;
}

export interface ViewQuestAction extends Redux.Action {
  type: 'VIEW_QUEST';
  quest: QuestDetails;
}

export interface UserLoginAction extends Redux.Action {
  type: 'USER_LOGIN';
  user: UserState;
}

export interface UserLogoutAction extends Redux.Action {
  type: 'USER_LOGOUT';
}

export interface SnackbarOpenAction extends Redux.Action {
  type: 'SNACKBAR_OPEN';
  message: string;
  action?: (e: any) => void;
  actionLabel?: string;
}

export interface SnackbarCloseAction extends Redux.Action {
  type: 'SNACKBAR_CLOSE';
}

export interface SavedQuestStoredAction {
  type: 'SAVED_QUEST_STORED';
  savedQuests: SavedQuestMeta[];
}

export interface SavedQuestDeletedAction {
  type: 'SAVED_QUEST_DELETED';
  savedQuests: SavedQuestMeta[];
}

export interface SavedQuestListAction {
  type: 'SAVED_QUEST_LIST';
  savedQuests: SavedQuestMeta[];
}

export interface SavedQuestSelectedAction {
  type: 'SAVED_QUEST_SELECTED';
  selected: SavedQuestMeta;
}

export interface MultiplayerSessionAction extends Redux.Action {
  type: 'MULTIPLAYER_SESSION';
  session: {id: number, secret: string};
}

// History of multiplayer sessions, as reported from the API server.
// We can use these to reconnect to earlier sessions we may have been
// disconnected from.
export interface MultiplayerHistoryAction extends Redux.Action {
  type: 'MULTIPLAYER_HISTORY';
  history: MultiplayerSessionMeta[];
}

export interface MultiplayerDisconnectAction extends Redux.Action {
  type: 'MULTIPLAYER_DISCONNECT';
}

export interface MultiplayerClientStatus extends Redux.Action {
  type: 'MULTIPLAYER_CLIENT_STATUS';
  client: ClientID;
  instance: InstanceID;
  status: StatusEvent;
}

// LocalActions wrap an existing action; this is so that inbound
// actions to the redux dispatch middleware that were created from
// another client's interaction are not re-broadcast in an endless loop
// to other clients.
export interface LocalAction extends Redux.Action {
  type: 'LOCAL';
  action: Redux.Action;
}

// Commits an in-flight action transaction (multiplayer)
export interface InflightCommitAction extends Redux.Action {
  type: 'INFLIGHT_COMMIT';
  id: number;
}

// Rejects an in-flight action transaction (multiplayer)
export interface InflightRejectAction extends Redux.Action {
  type: 'INFLIGHT_REJECT';
  id: number;
  error: string;
}

// Returns a generator of an "executable array" of the original action.
// This array can be passed to the generated Multiplayer redux middleware
// which invokes it and packages it to send to other multiplayer clients.
const MULTIPLAYER_ACTIONS: {[action: string]: (args: any) => Redux.Action} = {}
export function remoteify<A>(a: (args: A, dispatch?: Redux.Dispatch<any>, getState?: ()=>AppState)=>any) {
  const remoted = (args: A) => {
    return ([a.name, a, args] as any) as Redux.Action; // We know better >:}
  }
  if (MULTIPLAYER_ACTIONS[a.name]) {
    console.error('ERROR: Multiplayer action ' + a.name + ' already registered elsewhere! This will break multiplayer!');
  }
  MULTIPLAYER_ACTIONS[a.name] = remoted;
  return remoted;
}
export function getMultiplayerAction(name: string) {
  return MULTIPLAYER_ACTIONS[name];
}

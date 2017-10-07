import Redux from 'redux'
import {CardState, CardName, CardPhase, DialogIDType, SearchPhase, SearchSettings, SettingsType, TransitionType, UserState, SessionMetadata} from '../reducers/StateTypes'
import {QuestDetails} from '../reducers/QuestTypes'
import {ParserNode} from '../cardtemplates/Template'
import {Session} from 'expedition-qdl/lib/remote/Broker'

export interface AnnouncementSetAction extends Redux.Action {
  type: 'ANNOUNCEMENT_SET';
  open: boolean;
  message?: string;
  link?: string;
}

export interface DialogSetAction extends Redux.Action {
  type: 'DIALOG_SET';
  dialogID: DialogIDType;
}

export interface NavigateAction extends Redux.Action {
  type: 'NAVIGATE';
  to: CardState;
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
  message?: string;
  timeout?: number;
}

export interface SnackbarCloseAction extends Redux.Action {
  type: 'SNACKBAR_CLOSE';
}

export interface RemotePlaySessionAction extends Redux.Action {
  type: 'REMOTE_PLAY_SESSION';
  session: Session;
  uri: string;
}

// History of remote play sessions, as reported from the API server.
// We can use these to reconnect to earlier sessions we may have been
// disconnected from.
export interface RemotePlayHistoryAction extends Redux.Action {
  type: 'REMOTE_PLAY_HISTORY';
  history: SessionMetadata[];
}

// RemotePlayActions wrap an existing action; this is so that inbound
// actions to the redux dispatch middleware that were created from
// another client's interaction are not re-broadcast in an endless loop
// to other clients.
export interface RemotePlayAction extends Redux.Action {
  type: 'REMOTE_PLAY_ACTION';
  action: Redux.Action;
}

// Returns a generator of an "executable array" of the original action.
// This array can be passed to the generated RemotePlay redux middleware
// which invokes it and packages it to send to other remote play clients.
const REMOTE_ACTIONS: {[action: string]: (args: any) => Redux.Action} = {}
export function remoteify<A>(a: (args: A, dispatch?: Redux.Dispatch<any>)=>any) {
  const remoted = (args: A) => {
    return ([a.name, a, args] as any) as Redux.Action; // We know better >:}
  }
  REMOTE_ACTIONS[a.name] = remoted;
  return remoted;
}
export function getRemoteAction(name: string) {
  return REMOTE_ACTIONS[name];
}

import Redux from 'redux'
import {CardState, CardName, CardPhase, SettingNameType, SearchPhase, SearchSettings, SettingsType, TransitionType, UserState} from '../reducers/StateTypes'
import {QuestDetails} from '../reducers/QuestTypes'
import {ParserNode} from '../parser/Node'

export interface AnnouncementSetAction extends Redux.Action {
  type: 'ANNOUNCEMENT_SET';
  open: boolean;
  message?: string;
  link?: string;
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

export interface QuestCardAction {}

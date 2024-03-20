import Redux from 'redux';
import {ClientID, InstanceID, StatusEvent} from 'shared/multiplayer/Events';
import {Badge} from 'shared/schema/Constants';
import {Quest} from 'shared/schema/Quests';
import {ParserNode} from '../components/views/quest/cardtemplates/TemplateTypes';
import {
  AudioDataState,
  AudioState,
  CardName,
  CardState,
  CheckoutState,
  DialogIDType,
  IUserFeedback,
  MultiplayerSessionMeta,
  SavedQuestMeta,
  SearchParams,
  ServerStatusState,
  SettingsType,
  UserQuestInstance,
  UserQuestsType,
  UserState,
} from '../reducers/StateTypes';

export interface FetchServerStatusResponse {
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

export interface ClearHistoryAction extends Redux.Action {
  type: 'CLEAR_HISTORY';
}

export interface ServerStatusSetAction extends Redux.Action {
  type: 'SERVER_STATUS_SET';
  delta: Partial<ServerStatusState>;
}

export interface AudioSetAction extends Redux.Action {
  type: 'AUDIO_SET';
  delta: Partial<AudioState>;
}

export interface AudioDataSetAction extends Redux.Action {
  type: 'AUDIO_DATA_SET';
  data: Partial<AudioDataState>;
}

export interface CheckoutSetStateAction extends Redux.Action {
  type: 'CHECKOUT_SET_STATE';
  delta: Partial<CheckoutState>;
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
}

export interface ReturnAction extends Redux.Action {
  type: 'RETURN';
  matchFn?: (c: CardName, n: ParserNode) => boolean;
  before: boolean;
}

export interface QuestExitAction extends Redux.Action {
  type: 'QUEST_EXIT';
}

export interface QuestDetailsAction extends Redux.Action {
  type: 'QUEST_DETAILS';
  details: Quest;
}

export interface QuestNodeAction extends Redux.Action {
  type: 'QUEST_NODE';
  node: ParserNode;
  details?: Quest;
}

export interface ChangeSettingsAction extends Redux.Action {
  type: 'CHANGE_SETTINGS';
  settings: Partial<SettingsType>;
}

export interface CombatTimerStopAction extends Redux.Action {
  type: 'COMBAT_TIMER_STOP';
  elapsedMillis: number;
  settings: SettingsType;
}

export interface SearchChangeParamsAction extends Redux.Action {
  type: 'SEARCH_CHANGE_PARAMS';
  params: Partial<SearchParams>;
}

export interface SearchRequestAction extends Redux.Action {
  type: 'SEARCH_REQUEST';
}

export interface SearchResponseAction extends Redux.Action {
  type: 'SEARCH_RESPONSE';
  quests: Quest[];
  params: SearchParams;
  error: string;
}

export interface PreviewQuestAction extends Redux.Action {
  type: 'PREVIEW_QUEST';
  quest: Quest;
  savedTS: number|null;
  lastPlayed: Date|null;
}

export interface UserLoginAction extends Redux.Action {
  type: 'USER_LOGIN';
  user: UserState;
}

export interface UserFeedbacksAction extends Redux.Action {
  type: 'USER_FEEDBACKS';
  feedbacks: IUserFeedback[];
}

export interface UserBadgesAction extends Redux.Action {
  type: 'USER_BADGES';
  badges: Badge[];
}

export interface UserQuestsAction extends Redux.Action {
  type: 'USER_QUESTS';
  quests: UserQuestsType;
}

export interface UserQuestInstanceSelect extends Redux.Action {
  type: 'USER_QUEST_INSTANCE_SELECT';
  selected: UserQuestInstance;
}

export interface UserQuestsDeltaAction extends Redux.Action {
  type: 'USER_QUESTS_DELTA';
  delta: Partial<UserQuestsType>;
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

export interface SavedQuestSelectAction {
  type: 'SAVED_QUEST_SELECT';
  ts: number;
}

export interface StorageFreeAction {
  type: 'STORAGE_FREE';
  freeBytes: number;
}

export interface MultiplayerSessionAction extends Redux.Action {
  type: 'MULTIPLAYER_SESSION';
  session: {id: number, secret: string};
  client: string;
  instance: string;
}

export interface MultiplayerSyncAction extends Redux.Action {
  type: 'MULTIPLAYER_SYNC';
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

export interface MultiplayerConnectedAction extends Redux.Action {
  type: 'MULTIPLAYER_CONNECTED';
  connected: boolean;
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
export interface MultiplayerCommitAction extends Redux.Action {
  type: 'MULTIPLAYER_COMMIT';
  id: number;
}

// Rejects an in-flight action transaction (multiplayer)
export interface MultiplayerRejectAction extends Redux.Action {
  type: 'MULTIPLAYER_REJECT';
  id: number;
  error: string;
}

import {UserState as UserStateBase} from 'shared/auth/UserState';
import {StatusEvent} from 'shared/multiplayer/Events';
import {SessionID} from 'shared/multiplayer/Session';
import {Badge, ContentRating, Expansion, Genre, Language, Partition} from 'shared/schema/Constants';
import {Quest} from 'shared/schema/Quests';
import {AudioNode} from '../audio/AudioNode';
import {ThemeManager} from '../audio/ThemeManager';
import {ParserNode} from '../components/views/quest/cardtemplates/TemplateTypes';

export interface AnnouncementState {
  open: boolean;
  message: string;
  link?: string;
}

export interface ServerStatusState {
  announcement: AnnouncementState;
  isLatestAppVersion?: boolean;
}

export type AudioLoadingType = 'UNLOADED' | 'LOADING' | 'ERROR' | 'LOADED';
export interface AudioState {
  loaded: AudioLoadingType;
  paused: boolean;
  intensity: number;
  peakIntensity: number;
  sfx: string|null;
  timestamp: number;
}

export interface AudioDataState {
  audioNodes: {[file: string]: AudioNode}|null;
  themeManager: ThemeManager|null;
}

/// <reference path="../node_modules/@types/stripe-v3/index.d.ts" />
export interface CheckoutState {
  amount: number;
  processing: boolean;
  productcategory: string;
  productid: string;
  stripe: stripe.Stripe|null;
}

export type DialogIDType = null
  | 'EXIT_QUEST'
  | 'EXPANSION_SELECT'
  | 'EXIT_REMOTE_PLAY'
  | 'FEEDBACK'
  | 'REPORT_ERROR'
  | 'REPORT_QUEST'
  | 'MULTIPLAYER_STATUS'
  | 'MULTIPLAYER_PEERS'
  | 'SET_PLAYER_COUNT'
  | 'DELETE_SAVED_QUEST';
export interface DialogState {
  open: DialogIDType;
  message?: string;
}

export type CardThemeType = 'light' | 'red' | 'dark';

export interface EndSettings {
  text: string;
}

export interface SearchParams {
  [index: string]: any;
  id?: string;
  text?: string;
  age?: number;
  order?: string;
  mintimeminutes?: number;
  maxtimeminutes?: number;
  contentrating?: ContentRating;
  genre?: Genre;
  players?: number;
  owner?: string;
  partition?: Partition;
  expansions?: Expansion[];
  language?: Language;
  showOfficial?: boolean;
  showPrivate?: boolean;
}

export type DifficultyType = 'EASY' | 'NORMAL' | 'HARD' | 'IMPOSSIBLE';
export type FontSizeType = 'SMALL' | 'NORMAL' | 'LARGE';

export type ContentSetsType = Partial<{[index in Expansion]: boolean}>;

export interface SettingsType {
  [index: string]: any;
  audioEnabled: boolean;
  autoRoll: boolean;
  contentSets: ContentSetsType;
  difficulty: DifficultyType;
  experimental: boolean;
  fontSize: FontSizeType;
  multitouch: boolean;
  numLocalPlayers: number;
  showHelp: boolean;
  simulator: boolean;
  timerSeconds: number;
  vibration: boolean;
}

export interface SnackbarState {
  action?: (e: any) => void;
  actionLabel?: string;
  open: boolean;
  message: string;
  timeout: number;
}

export interface SavedQuestMeta {
  details: Quest;
  ts: number;
  pathLen?: number;
  savedBytes?: number;
}

export type CardName =
  'QUEST_PREVIEW' |
  'QUEST_HISTORY' |
  'SAVED_QUESTS' |
  'CHECKOUT_ENTRY' |
  'CHECKOUT_DONE' |
  'PLAYER_COUNT_SETTING' |
  'QUEST_SETUP' |
  'QUEST_END' |
  'QUEST_CARD' |
  'TUTORIAL_QUESTS' |
  'GM_CARD' |
  'SPLASH_CARD' |
  'SEARCH_DISCLAIMER' |
  'SEARCH_CARD' |
  'SEARCH_SETTINGS' |
  'SETTINGS' |
  'REMOTE_PLAY_CONNECT' |
  'REMOTE_PLAY_LOBBY' |
  'ACCOUNT';

export interface CardState {
  questId: string;
  name: CardName;
  ts: number;
  key: string;
  overrideDebounce?: boolean;
}

export type TransitionClassType = 'next' | 'prev' | 'instant' | 'nav';

export interface QuestState {
  details: Quest;
  node: ParserNode;
  // Additional details populated depending on from where
  // the user approaches the quest
  lastPlayed: Date|null;
  savedTS: number|null;
}

export interface SavedQuestState {
  list: SavedQuestMeta[];
  selectedTS: number|null;
  freeBytes: number|null;
}

export interface SearchState {
  params: SearchParams;
  results: Quest[]|null;
  searching: boolean;
}

export interface UserQuestInstance {
  details: Quest;
  lastPlayed: Date;
}

export interface UserQuestsType {
  [questId: string]: UserQuestInstance;
}

export interface IUserFeedback {
  rating: number;
  text: string;
  quest: UserQuestInstance;
}

export interface UserState extends UserStateBase {
  feedbacks?: IUserFeedback[];
  badges?: Badge[];
}

export interface UserQuestsState {
  history: UserQuestsType;
}

export type FeedbackType = 'feedback'|'rating'|'report_error'|'report_quest';

export interface MultiplayerSessionType {
  secret: string;
  id: SessionID;
}

export interface MultiplayerSessionMeta {
  id: number;
  secret: string;
  questTitle: string;
  peerCount: number;
  lastAction: string;
}

export interface MultiplayerState {
  clientStatus: {[client: string]: StatusEvent};
  client: string;
  instance: string;
  history: MultiplayerSessionMeta[];
  session: MultiplayerSessionType|null;
  syncing: boolean;
  multiEvent: boolean;
  syncID: number;
  connected: boolean;
}

// AppStateBase is what's stored in AppState._history.
// It contains all the reduced state that should be restored
// to the redux main state when the "<" button is pressed in
// the UI. Notably, it excludes "permanent" attributes
// such as settings.
export interface AppStateBase {
  audio: AudioState;
  card: CardState;
  checkout: CheckoutState;
  dialog: DialogState;
  quest: QuestState;
}

export interface AppState extends AppStateBase {
  audioData: AudioDataState;
  multiplayer: MultiplayerState;
  saved: SavedQuestState;
  search: SearchState;
  settings: SettingsType;
  user: UserState;
  serverstatus: ServerStatusState;
  snackbar: SnackbarState;
  commitID: number;
  userQuests: UserQuestsState;
}

export interface AppStateWithHistory extends AppState {
  _history: AppStateBase[];
  _return: boolean;
  _committed?: AppStateWithHistory; // A trailing version of _history, before all in-flight actions are resolved.
}

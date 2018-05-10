import * as Redux from 'redux'
import {QuestDetails} from './QuestTypes'
import {TemplatePhase, TemplateContext} from '../cardtemplates/TemplateTypes'
import {ParserNode} from '../cardtemplates/TemplateTypes'
import {SessionID} from 'expedition-qdl/lib/multiplayer/Session'
import {StatusEvent} from 'expedition-qdl/lib/multiplayer/Events'
import {GenreType, ContentRatingLabelType, LanguageType} from '../Constants'

export interface AnnouncementState {
  open: boolean;
  message: string;
  link: string;
}

export type AudioLoadingType = false | 'LOADING' | 'ERROR' | true;
export interface AudioState {
  loaded: AudioLoadingType;
  paused: boolean;
  intensity: number;
  peakIntensity: number;
  sfx: string|null;
  timestamp: number;
}

/// <reference path="../node_modules/@types/stripe-v3/index.d.ts" />
export interface CheckoutState {
  amount: number;
  processing: boolean;
  productcategory: string;
  productid: string;
  stripe: stripe.Stripe|null;
}

export type DialogIDType = null | 'EXIT_QUEST' | 'EXPANSION_SELECT' | 'EXIT_REMOTE_PLAY' | 'FEEDBACK' | 'REPORT_ERROR' | 'REPORT_QUEST' | 'MULTIPLAYER_STATUS' | 'SET_PLAYER_COUNT' | 'DELETE_SAVED_QUEST';
export interface DialogState {
  open: DialogIDType;
  message?: string;
}

export type CardThemeType = 'LIGHT' | 'RED' | 'DARK';

export interface EndSettings {
  text: string;
}

export type SearchPhase = 'DISCLAIMER' | 'SETTINGS' | 'DETAILS' | 'SEARCH' | 'PRIVATE';

export interface SearchSettings {
  [index:string]: any;
  id?: string;
  text?: string;
  age?: number;
  order?: string;
  mintimeminutes?: number;
  maxtimeminutes?: number;
  contentrating?: ContentRatingLabelType;
  genre?: GenreType;
  players?: number;
  owner?: string;
  partition?: 'expedition-public' | 'expedition-private';
  expansions?: ExpansionsType[];
  language?: LanguageType;
}

export type DifficultyType = 'EASY' | 'NORMAL' | 'HARD' | 'IMPOSSIBLE';
export type FontSizeType = 'SMALL' | 'NORMAL' | 'LARGE';

export type ExpansionsType = 'horror';
export interface ContentSetsType {
  [index:string]: boolean;
  horror: boolean;
}

export interface SettingsType {
  audioEnabled: boolean;
  autoRoll: boolean;
  contentSets: ContentSetsType;
  difficulty: DifficultyType;
  experimental: boolean;
  fontSize: FontSizeType;
  multitouch: boolean;
  numPlayers: number;
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
  details: QuestDetails;
  ts: number;
}

export type SavedQuestsPhase = 'LIST' | 'DETAILS';

export type MultiplayerPhase = 'CONNECT'|'LOBBY';
export type CheckoutPhase = 'ENTRY' | 'DONE';
export type CardName = 'SAVED_QUESTS' | 'CHECKOUT' | 'PLAYER_COUNT_SETTING' | 'QUEST_SETUP' | 'QUEST_END' | 'QUEST_CARD' | 'FEATURED_QUESTS' | 'SPLASH_CARD' | 'SEARCH_CARD' | 'SETTINGS' | 'ADVANCED' | 'REMOTE_PLAY';
export type CardPhase = TemplatePhase | SearchPhase | MultiplayerPhase | CheckoutPhase | SavedQuestsPhase;
export interface CardState {
  questId: string;
  name: CardName;
  ts: number;
  key: string;
  transitioning?: boolean;
  phase: CardPhase|null;
  overrideDebounce?: boolean;
}

export type TransitionType = 'NEXT' | 'PREV' | 'INSTANT';

export interface QuestState {
  details: QuestDetails;
  node: ParserNode;
  seed: string;
}

export interface SavedQuestState {
  list: SavedQuestMeta[];
  selected: SavedQuestMeta|null
}

export interface SearchState {
  search: SearchSettings;
  selected: QuestDetails|null;
  results: QuestDetails[];
  searching: boolean;
}

export interface UserQuestsType {
  [questId:string]: {
    lastPlayed: Date;
  };
}

export interface UserState {
  loggedIn: boolean;
  id: string;
  name: string;
  image: string;
  email: string;
  quests: UserQuestsType;
}

export interface UserFeedbackState {
  type: 'feedback' | 'rating' | 'report_error' | 'report_quest';
  rating?: number;
  text: string;
  anonymous: boolean;
}

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
  session: MultiplayerSessionType|null;
  history: MultiplayerSessionMeta[];
  syncing: boolean;
  clientStatus: {[client: string]: StatusEvent};
}

// AppStateBase is what's stored in AppState._history.
// It contains all the reduced state that should be restored
// to the redux main state when the "<" button is pressed in
// the UI. Notably, it does NOT include non-undoable attributes
// such as settings.
export interface AppStateBase {
  announcement: AnnouncementState;
  audio: AudioState;
  card: CardState;
  checkout: CheckoutState;
  dialog: DialogState;
  quest: QuestState;
  search: SearchState;
  snackbar: SnackbarState;
  user: UserState;
  userFeedback: UserFeedbackState;
  commitID: number;
}

export interface AppState extends AppStateBase {
  settings: SettingsType;
  remotePlay: MultiplayerState;
  saved: SavedQuestState;
}

export interface AppStateWithHistory extends AppState {
  _history: AppStateBase[];
  _return: boolean;
  _committed?: AppStateWithHistory; // A trailing version of _history, before all in-flight actions are resolved.
}

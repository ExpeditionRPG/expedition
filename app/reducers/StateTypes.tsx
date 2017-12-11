import * as Redux from 'redux'
import {QuestDetails} from './QuestTypes'
import {TemplatePhase, TemplateContext} from '../cardtemplates/TemplateTypes'
import {ParserNode} from '../cardtemplates/Template'
import {Session, SessionID, SessionMetadata} from 'expedition-qdl/lib/remote/Session'
import {StatusEvent} from 'expedition-qdl/lib/remote/Events'
import {GenreType, ContentRatingLabelType} from '../Constants'

export interface AnnouncementState {
  open: boolean;
  message: string;
  link: string;
}

export interface AudioState {
  paused: boolean;
  intensity: number;
  peakIntensity: number;
  sfx: string;
  timestamp: number;
}

export type DialogIDType = null | 'EXIT_QUEST' | 'EXPANSION_SELECT' | 'EXIT_REMOTE_PLAY';

export interface DialogState {
  open: DialogIDType;
}

export type CardThemeType = 'LIGHT' | 'RED' | 'DARK';

export interface EndSettings {
  text: string;
}

export type SearchPhase = 'DISCLAIMER' | 'SETTINGS' | 'DETAILS' | 'SEARCH' | 'PRIVATE';

export interface SearchSettings {
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
  fontSize: FontSizeType;
  multitouch: boolean;
  numPlayers: number;
  showHelp: boolean;
  timerSeconds: number;
  vibration: boolean;
}

export interface SnackbarState {
  open: boolean;
  message: string;
  timeout: number;
}

export type RemotePlayPhase = 'CONNECT'|'LOBBY';

export type CardName = 'PLAYER_COUNT_SETTING' | 'QUEST_START' | 'QUEST_END' | 'QUEST_CARD' | 'FEATURED_QUESTS' | 'SPLASH_CARD' | 'SEARCH_CARD' | 'SETTINGS' | 'ADVANCED' | 'REPORT' | 'REMOTE_PLAY';
export type CardPhase = TemplatePhase | SearchPhase | RemotePlayPhase;
export interface CardState {
  name: CardName;
  ts: number;
  transitioning?: boolean;
  phase?: CardPhase;
  overrideDebounce?: boolean;
}

export type TransitionType = 'NEXT' | 'PREV' | 'INSTANT';

export interface QuestState {
  details: QuestDetails;
  node: ParserNode;
  seed: string;
}

export interface SearchState {
  search: SearchSettings;
  selected: QuestDetails;
  results: QuestDetails[];
  searching: boolean;
}

export interface UserState {
  loggedIn: boolean;
  id: string;
  name: string;
  image: string;
  email: string;
}

export interface UserFeedbackState {
  type: 'rating' | 'report';
  rating?: number;
  text: string;
}

export interface RemotePlayState {
  session: Session;
  history: SessionMetadata[];
  syncing: boolean;
  clientStatus: {[client: string]: StatusEvent},
}

export interface AppState {
  announcement: AnnouncementState;
  audio: AudioState;
  card: CardState;
  dialog: DialogState;
  quest: QuestState;
  search: SearchState;
  settings: SettingsType;
  snackbar: SnackbarState;
  user: UserState;
  userFeedback: UserFeedbackState;
  remotePlay: RemotePlayState;
}

export interface AppStateWithHistory extends AppState {
  _history: AppState[];
  _return: boolean;
  _inflight: {id: string, committed: boolean, action: Redux.Action}[];
  _committed: AppStateWithHistory; // A trailing version of _history, before _inflight actions are applied.
}

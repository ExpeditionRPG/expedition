import {QuestDetails, DifficultyType, QuestContext} from './QuestTypes'
import {TemplatePhase} from '../cardtemplates/Template'
import {ParserNode} from '../parser/Node'

import {GenreType, ContentRatingLabelType} from '../Constants'

export interface AnnouncementState {
  open: boolean;
  message?: string;
  link?: string;
}

export type CardThemeType = 'LIGHT' | 'RED' | 'DARK';
export type SettingNameType = 'numPlayers' | 'difficulty' | 'viewMode';

export interface EndSettings {
  text: string;
}

export interface SearchSettings {
  text: string;
  age: number;
  order: string;
  mintimeminutes: number;
  maxtimeminutes: number;
  contentrating: ContentRatingLabelType;
  genre: GenreType;
}

export type SearchPhase = 'DISCLAIMER' | 'SETTINGS' | 'DETAILS' | 'SEARCH';

export interface SettingsType {
  autoRoll: boolean;
  numPlayers: number;
  difficulty: DifficultyType;
  showHelp: boolean;
  multitouch: boolean;
  vibration: boolean;
}

export interface SnackbarState {
  open: boolean;
  message?: string;
  timeout?: number;
}

export type CardName = 'PLAYER_COUNT_SETTING' | 'QUEST_START' | 'QUEST_END' | 'QUEST_CARD' | 'FEATURED_QUESTS' | 'SPLASH_CARD' | 'SEARCH_CARD' | 'SETTINGS' | 'ADVANCED' | 'REPORT';
export type CardPhase = TemplatePhase | SearchPhase;
export interface CardState {
  name: CardName;
  ts: number;
  phase?: CardPhase;
  overrideDebounce?: boolean;
}

export type TransitionType = 'NEXT' | 'PREV' | 'INSTANT';

export interface QuestState {
  details: QuestDetails;
  node: ParserNode;
}

export interface SearchState {
  search: SearchSettings;
  selected: QuestDetails;
  results: QuestDetails[];
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

export interface AppState {
  announcement: AnnouncementState;
  card: CardState;
  quest: QuestState;
  search: SearchState;
  settings: SettingsType;
  snackbar: SnackbarState;
  user: UserState;
  userFeedback: UserFeedbackState;
}

export interface AppStateWithHistory extends AppState {
  _history: AppState[];
  _return: boolean;
}

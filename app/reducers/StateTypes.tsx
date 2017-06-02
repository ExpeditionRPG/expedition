import {QuestDetails, DifficultyType, QuestContext} from './QuestTypes'
import {TemplatePhase} from '../cardtemplates/Template'
import {ParserNode} from '../parser/Node'

export type SettingNameType = 'numPlayers' | 'difficulty' | 'viewMode';

export interface DOMElement {
  attributes: any; // NamedNodeMap
  outerHTML: string;
  parentNode: DOMElement;
  tagName: string;
};

export interface CheerioElement {
  append: (elem: CheerioElement) => void;
  attr: (k: string, v?: string) => string;
  attribs: {[k: string]: string};
  children: (s?: string) => CheerioElementSet;
  clone: () => CheerioElement;
  find: (s: string) => CheerioElementSet;
  get: (i: number) => DOMElement;
  html: (htmlString?: string) => string;
  length: number;
  next: () => CheerioElement;
  parent: () => CheerioElement;
  text: () => string;
}

export interface CheerioElementSet {
  eq: (n: number) => CheerioElement;
  first: () => CheerioElement;
  get: (i: number) => CheerioElement;
  length: number;
  [k: number]: DOMElement;
}

export interface EndSettings {
  text: string;
}

export interface SearchSettings {
  text: string;
  age: string;
  order: string;
  owner: string;
}

export type SearchPhase = 'DISCLAIMER' | 'SETTINGS' | 'DETAILS' | 'SEARCH';
export function isSearchPhase(phase: string) : boolean {
  return (phase === 'DISCLAIMER' || phase === 'SETTINGS' || phase === 'DETAILS' || phase === 'SEARCH');
}

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
  details?: QuestDetails;
  node?: ParserNode;
}

export interface SearchState {
  search: SearchSettings;
  selected?: QuestDetails;
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

import {QuestDetails, CombatState, DifficultyType, CombatPhaseNameType, QuestContext} from './QuestTypes'
import {CombatResult, RoleplayResult} from '../parser/Handlers'

export type SettingNameType = 'numPlayers' | 'difficulty' | 'viewMode';

export interface DOMElement {
  attributes: any; // NamedNodeMap
  outerHTML: string;
  parentNode: DOMElement;
  tagName: string;
};

export interface XMLElement {
  append: (elem: XMLElement) => void;
  attr: (k: string, v?: string) => string;
  attribs: {[k: string]: string};
  children: (s?: string) => XMLElementSet;
  clone: () => XMLElement;
  find: (s: string) => XMLElementSet;
  get: (i: number) => DOMElement;
  html: () => string;
  length: number;
  next: () => XMLElement;
  parent: () => XMLElement;
  text: () => string;
}

export interface XMLElementSet {
  eq: (n: number) => XMLElement;
  get: (i: number) => DOMElement;
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

export type CardName = 'PLAYER_COUNT_SETTING' | 'QUEST_START' | 'QUEST_END' | 'QUEST_CARD' | 'FEATURED_QUESTS' | 'SPLASH_CARD' | 'SEARCH_CARD' | 'SETTINGS' | 'CUSTOM_COMBAT' | 'ADVANCED' | 'REPORT';
export interface CardState {
  name: CardName;
  ts: number;
  phase?: CombatPhaseNameType | SearchPhase;
  overrideDebounce?: boolean;
}

export type TransitionType = 'NEXT' | 'PREV' | 'INSTANT';

export interface QuestState {
  details?: QuestDetails;
  node?: XMLElement;
  result?: CombatResult|RoleplayResult;
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
  combat: CombatState;
  quest: QuestState;
  search: SearchState;
  settings: SettingsType;
  user: UserState;
  userFeedback: UserFeedbackState;
}

export interface AppStateWithHistory extends AppState {
  _history: AppState[];
  _return: boolean;
}

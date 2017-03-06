import {QuestDetails, CombatState, DifficultyType, CombatPhaseNameType, QuestContext} from './QuestTypes'
import {CombatResult, RoleplayResult} from '../QuestParser'

export type SettingNameType = 'numPlayers' | 'difficulty' | 'viewMode';

export interface DOMElement {
  attributes: any; //NamedNodeMap
  outerHTML: string;
  parentNode: DOMElement;
  tagName: string;
};

export interface XMLElement {
  children: (s?: string) => XMLElementSet;
  attr: (k: string, v?: string) => string;
  append: (elem: XMLElement) => void;
  clone: () => XMLElement;
  parent: () => XMLElement;
  next: () => XMLElement;
  get: (i: number) => DOMElement;
  find: (s: string) => XMLElementSet;
  text: () => string;
  html: () => string;
  attribs: {[k: string]: string};
  length: number;
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
  numPlayers: number;
  difficulty: DifficultyType;
  showHelp: boolean;
  multitouch: boolean;
  vibration: boolean;
}

export type CardName = 'PLAYER_COUNT_SETTING' | 'QUEST_START' | 'QUEST_END' | 'QUEST_CARD' | 'FEATURED_QUESTS' | 'SPLASH_CARD' | 'SEARCH_CARD' | 'SETTINGS' | 'CUSTOM_COMBAT' | 'ADVANCED';
export interface CardState {
  name: CardName;
  ts: number;
  phase?: CombatPhaseNameType | SearchPhase;
  overrideDebounce?: boolean;
}

export type TransitionType = 'NEXT' | 'PREV' | 'INSTANT';

export interface QuestState {
  feedback?: QuestFeedbackState;
  details?: QuestDetails;
  node?: XMLElement;
  result?: CombatResult|RoleplayResult;
}

export interface QuestFeedbackState {
  text: string;
  shareUserEmail?: boolean;
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

export interface AppState {
  card: CardState;
  combat: CombatState;
  settings: SettingsType;
  quest: QuestState;
  search: SearchState;
  user: UserState;
}

export interface AppStateWithHistory extends AppState {
  _history: AppState[];
  _return: boolean;
}

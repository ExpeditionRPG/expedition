import {QuestDetails, CombatDetails, CombatDifficultyType, CombatPhaseNameType} from './QuestTypes'

export type SettingNameType = 'numPlayers' | 'difficulty' | 'viewMode';

export type ViewModeType = 'BEGINNER' | 'EXPERT';

export interface XMLElement {
  remove(): void;
  children: XMLElement[];
  getAttribute(attrib: string): string;
  hasAttribute(attrib: string): boolean;
  appendChild(child: XMLElement): void;
  cloneNode(deep: boolean): XMLElement;
  localName: string;
  tagName: string;
  parentNode: XMLElement;
  textContent: string;
  attributes: {name: string}[];
  innerHTML: string;
  setAttribute(attrib: string, value: any): void;
  nextElementSibling?: XMLElement;
  querySelector(query: string): XMLElement;
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
  difficulty: CombatDifficultyType;
  viewMode: ViewModeType;
  multitouch: boolean;
}

export type CardName = 'PLAYER_COUNT_SETTING' | 'QUEST_START' | 'QUEST_CARD' | 'FEATURED_QUESTS' | 'SPLASH_CARD' | 'SEARCH_CARD';
export interface CardState {
  name: CardName;
  phase?: CombatPhaseNameType;
  ts: number;
}

export type TransitionType = 'NEXT' | 'PREV' | 'INSTANT';

export interface QuestState {
  details?: QuestDetails;
  combat?: CombatDetails;
  node?: XMLElement;
}

export interface SearchState {
  phase: SearchPhase;
  search: SearchSettings;
  selected?: QuestDetails;
  results: QuestDetails[];
}

export interface UserState {
  loggedIn: boolean;
  id: string;
  name: string;
  image: string;
}

export interface AppState {
  card: CardState;
  settings: SettingsType;
  quest: QuestState;
  search: SearchState;
  user: UserState;
}


import {QuestDetails, CombatDetails, CombatDifficultyType, CombatPhaseNameType} from './QuestTypes'

export type SettingNameType = 'numPlayers' | 'difficulty' | 'viewMode';

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

export interface SettingsType {
  numPlayers: number;
  difficulty: CombatDifficultyType;
  viewMode: 'BEGINNER' | 'EXPERT';
}

export type CardName = 'QUEST_START' | 'QUEST_CARD' | 'FEATURED_QUESTS' | 'SPLASH_CARD';
export interface CardState {
  name: CardName;
  phase?: CombatPhaseNameType;
  ts: number;
}

export type TransitionType = 'NEXT' | 'PREV' | 'INSTANT';

export interface ListItemType {
  value: string;
  primaryText: string;
  secondaryText: string;
}

export interface ListCardType {
  hint: string;
  title: string;
  items: ListItemType[];
}

export interface QuestState {
  details?: QuestDetails;
  combat?: CombatDetails;
  node?: XMLElement;
}

export interface AppState {
  card: CardState;
  settings: SettingsType;
  quest: QuestState;
}
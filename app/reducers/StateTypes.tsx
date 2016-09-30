import {XMLElement, QuestResult} from '../scripts/QuestParser'

export type DialogIDType = 'TODO';

export type CardNameType = 'SPLASH_CARD' | 'FEATURED_QUESTS' | 'LIST_CARD' | 'TEST_CARD';
export type TransitionType = 'NEXT' | 'PREV' | 'INSTANT';

export type SettingNameType = 'numPlayers' | 'difficulty' | 'viewMode';
export interface SettingsType {
  numPlayers: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  viewMode: 'BEGINNER' | 'EXPERT';
}

export interface QuestType {
  id?: string;
  url?: string;
  xml?: string;
  created?: string;
  modified?: string;
  published?: string;
  shared?: string;
  short_url?: string;
  meta_title?: string,
  meta_summary?: string,
  meta_minPlayers?: number,
  meta_maxPlayers?: number,
  meta_email?: string,
  meta_url?: string,
  meta_minTimeMinutes?: number,
  meta_maxTimeMinutes?: number,
  meta_author?: string
};

export interface ListItemType {
  value: string;
  primaryText: string;
  secondaryText: string;
}

export interface CardTypeBase {
  entry: TransitionType;
}


export interface ListCardType {
  hint: string;
  title: string;
  items: ListItemType[];
}

export interface FeaturedQuestsAction extends CardTypeBase {
  name: 'FEATURED_QUESTS';
}

export interface QuestAction extends CardTypeBase, QuestResult {}

export interface QuestStartAction extends CardTypeBase {
  name: 'QUEST_START';
}

export interface SplashCardAction extends CardTypeBase {
  name: 'SPLASH_CARD';
}

export interface TestCardAction extends CardTypeBase {
  title: string;
  name: 'TEST_CARD';
}

// Card type attributes that are relevant across all cards
export type CardActionType = SplashCardAction | FeaturedQuestsAction | TestCardAction | QuestStartAction | QuestAction;

export interface QuestCardAction {

}

export interface AppState {
  card: CardActionType[];
  settings: SettingsType;
  quest: QuestType;
}
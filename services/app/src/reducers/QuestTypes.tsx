import {ThemeType} from 'shared/schema/Constants';

// TODO: Dedupe this with api/models/Quests QuestAttributes interface.
export interface QuestDetails {
  id: string;
  title: string;
  summary: string;
  author: string;
  publishedurl: string;
  xml?: string;
  created?: string;
  published?: string;
  minplayers?: number;
  maxplayers?: number;
  email?: string;
  url?: string;
  mintimeminutes?: number;
  maxtimeminutes?: number;
  ratingcount?: number;
  ratingavg?: number;
  genre?: string;
  contentrating?: string;
  expansionhorror?: boolean;
  questversion?: number;
  partition?: string;
  language?: string;
  theme?: ThemeType;
  official?: boolean;
  awarded?: string;
  requirespenpaper?: boolean;
}

export type QuestCardName = 'COMBAT' | 'ROLEPLAY';

export interface Choice {
  idx: number;
  jsx: JSX.Element;
}

export interface EventParameters {
  xp?: boolean;
  loot?: boolean;
  heal?: number;
}

export interface RoleplayElement {
  type: 'text' | 'instruction';
  jsx: JSX.Element;
  icon?: string;
}

export interface Enemy {name: string; tier: number; class?: string; }

export interface Loot {tier: number; count: number; }

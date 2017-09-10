import {TemplateState} from '../cardtemplates/TemplateTypes'

export interface QuestDetails {
  id?: string;
  xml?: string;
  created?: string;
  publishedurl?: string;
  published?: string;
  title?: string,
  summary?: string,
  minplayers?: number,
  maxplayers?: number,
  email?: string,
  url?: string,
  mintimeminutes?: number,
  maxtimeminutes?: number,
  author?: string,
  ratingcount?: number,
  ratingavg?: number,
  genre?: string,
  contentrating?: string
};

export type QuestCardName = 'COMBAT' | 'ROLEPLAY';

export interface Choice {
  text: string;
  idx: number;
}

export interface EventParameters {
  xp?: boolean;
  loot?: boolean;
  heal?: number;
}

export interface RoleplayElement {
  type: 'text' | 'instruction';
  text: string;
  icon?: string;
}

export type Enemy = {name: string, tier: number, class?: string};

export type Loot = {tier: number, count: number};

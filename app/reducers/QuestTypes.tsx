import * as React from 'react'
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
  contentrating?: string,
  expansionhorror?: boolean,
};

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

export type Enemy = {name: string, tier: number, class?: string};

export type Loot = {tier: number, count: number};

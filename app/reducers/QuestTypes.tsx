import * as React from 'react'
import {TemplateState} from '../components/views/quest/cardtemplates/TemplateTypes'

// TODO: Dedupe this with expedition-api/app/models/Quests QuestAttributes interface.
export type QuestThemeType = 'base' | 'horror';

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
  theme?: QuestThemeType;
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

export type Enemy = {name: string, tier: number, class?: string};

export type Loot = {tier: number, count: number};

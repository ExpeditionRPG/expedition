
import {getStore} from '../Store'
import {templateScope, TemplateState} from '../cardtemplates/Template'

export interface QuestDetails {
  id?: string;
  xml?: string;
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
  author?: string
};

export type QuestCardName = 'COMBAT' | 'ROLEPLAY';

export type DifficultyType = 'EASY' | 'NORMAL' | 'HARD' | 'IMPOSSIBLE';

export interface QuestContext {
  // Scope is passed to the parser when rendering
  // nodes that are potentially parseable via MathJS.
  scope: any; // TODO: required fields later
  views: any; // TODO: {string: number}
  templates: TemplateState;
}
export function defaultQuestContext(): QuestContext {
  // Caution: Scope is the API for Quest Creators.
  // New endpoints should be added carefully b/c we'll have to support them.
  // Behind-the-scenes data can be added to the context outside of scope
  return {
    scope: {
      _: {
        numAdventurers: function(): number {
          const settings = getStore().getState().settings;
          return settings && settings.numPlayers;
        },
        viewCount: function(id: string): number {
          return this.views[id] || 0;
        },
        ...templateScope()
      },
    },
    views: {},
    templates: {},
  };
}

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

import {encounters} from '../Encounters'
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

  views: {[id:string]: number};
  templates: TemplateState;

  // Extern is an interface for loading in dependencies to functions in the context.
  // We wrap these dependencies in this way to allow for serialization.
  extern: (x: string) => any;

  // The list of choices, events, and jumps that produced this context, serialized.
  // Given the path and original quest XML, we should be able to recreate
  // context given this path.
  path: (string|number)[];
}

// getExtern implements QuestContext.extern.
function getExtern(x: string): any {
  switch(x) {
    case 'settings':
      return getStore().getState().settings;
    case 'encounters':
      return encounters;
    default:
      return null;
  }
}

export function linkQuestContext(q: QuestContext): QuestContext {
  q.extern = getExtern;
  return q;
}

export function defaultQuestContext(): QuestContext {
  // Caution: Scope is the API for Quest Creators.
  // New endpoints should be added carefully b/c we'll have to support them.
  // Behind-the-scenes data can be added to the context outside of scope
  return {
    extern: getExtern,
    scope: {
      _: {
        numAdventurers: function(): number {
          const settings = this.extern('settings');
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
    path: [],
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

import Redux from 'redux'
import {QuestState} from './StateTypes'
import {QuestNodeAction, ViewQuestAction} from '../actions/ActionTypes'
import {getStore} from '../Store'
import {ParserNode} from '../cardtemplates/TemplateTypes'
import * as seedrandom from 'seedrandom'

const cheerio = require('cheerio') as CheerioAPI;

function autoseed(): string {
  let seed = '';
  seedrandom(undefined, { pass: function(p: seedrandom.prng, s: string): seedrandom.prng {
    seed = s;
    return p;
  }});
  return seed;
}

export const initialState: QuestState = {
  details: {
    partition: '',
    id: '',
    title: '',
    summary: '',
    author: '',
    publishedurl: '',
  },
  seed: autoseed(),
  node: new ParserNode(cheerio.load('<quest></quest>')('quest'), {
    scope: {_: {}},
    views: {},
    templates: {},
    path: ([] as any),
    _templateScopeFn: ()=>{ return {}; },
  }),
};

export function quest(state: QuestState = initialState, action: Redux.Action): QuestState {
  switch (action.type) {
    case 'QUEST_EXIT':
      return {...state, ...initialState};
    case 'QUEST_NODE':
      return {...state,
        details: (action as QuestNodeAction).details || state.details,
        node: (action as QuestNodeAction).node,
        seed: autoseed(),
      };
    case 'VIEW_QUEST':
      return {...state, details: (action as ViewQuestAction).quest, seed: autoseed()};
    default:
      return state;
  }
}

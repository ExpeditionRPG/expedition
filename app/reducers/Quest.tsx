import Redux from 'redux'
import {QuestState} from './StateTypes'
import {QuestDetailsAction, QuestNodeAction, ViewQuestAction} from '../actions/ActionTypes'
import {ParserNode} from '../components/views/quest/cardtemplates/TemplateTypes'
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

export const initialQuestState: QuestState = {
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

export function quest(state: QuestState = initialQuestState, action: Redux.Action): QuestState {
  switch (action.type) {
    case 'QUEST_DETAILS':
      return {...state, details: (action as QuestDetailsAction).details};
    case 'QUEST_EXIT':
      return {...state, ...initialQuestState};
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

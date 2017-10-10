import Redux from 'redux'
import {QuestState} from './StateTypes'
import {QuestNodeAction, ViewQuestAction} from '../actions/ActionTypes'
import {getStore} from '../Store'
import * as seedrandom from 'seedrandom'

function autoseed(): string {
  let seed: string;
  seedrandom(null, { pass: function(p: seedrandom.prng, s: string): seedrandom.prng {
    seed = s;
    return p;
  }});
  return seed;
}

export const initialState: QuestState = {
  details: {},
  node: null,
  seed: autoseed(),
};

export function quest(state: QuestState = initialState, action: Redux.Action): QuestState {
  switch (action.type) {
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

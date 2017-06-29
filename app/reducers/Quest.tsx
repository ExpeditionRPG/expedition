import Redux from 'redux'
import {QuestState, AppState} from './StateTypes'
import {QuestContext} from './QuestTypes'
import {QuestNodeAction, ViewQuestAction} from '../actions/ActionTypes'
import {getStore} from '../Store'
import {templateScope} from '../cardtemplates/Template'

export const initialState: QuestState = {
  details: {},
  node: null,
};

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
    path: [],
  };
}

export function quest(state: QuestState = initialState, action: Redux.Action): QuestState {
  switch (action.type) {
    case 'QUEST_NODE':
      return {...state,
        details: (action as QuestNodeAction).details || state.details,
        node: (action as QuestNodeAction).node,
      };
    case 'VIEW_QUEST':
      return {...state, details: (action as ViewQuestAction).quest};
    default:
      return state;
  }
}

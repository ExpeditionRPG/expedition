import Redux from 'redux'
import {QuestState} from './StateTypes'
import {QuestContext} from './QuestTypes'
import {QuestNodeAction, ViewQuestAction} from '../actions/ActionTypes'
import {getStore} from '../Store'
import {templateScope} from '../cardtemplates/Template'

export const initialState: QuestState = {
  details: {},
  node: null,
};

export function defaultQuestContext(): QuestContext {
  const populateScopeFn = function() {
    return {
      numAdventurers: function(): number {
        const settings = getStore().getState().settings;
        return settings && settings.numPlayers;
      },
      viewCount: function(id: string): number {
        return this.views[id] || 0;
      },
      ...templateScope(),
    };
  };

  // Caution: Scope is the API for Quest Creators.
  // New endpoints should be added carefully b/c we'll have to support them.
  // Behind-the-scenes data can be added to the context outside of scope
  const newContext: QuestContext = {
    scope: {
      _: populateScopeFn(),
    },
    views: {},
    templates: {},
    path: ([] as any),
    _templateScopeFn: populateScopeFn, // Used to refill template scope elsewhere (without dependencies)
  };

  for (const k of Object.keys(newContext.scope._)) {
    newContext.scope._[k] = (newContext.scope._[k] as any).bind(newContext);
  }

  return newContext;
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

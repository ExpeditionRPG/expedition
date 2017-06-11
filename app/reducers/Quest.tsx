import Redux from 'redux'
import {QuestState, AppState} from './StateTypes'
import {QuestNodeAction, ViewQuestAction} from '../actions/ActionTypes'

export const initialState: QuestState = {
  details: {},
  node: null,
};

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

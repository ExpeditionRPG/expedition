import Redux from 'redux'
import {QuestState, AppState} from './StateTypes'
import {QuestNodeAction} from '../actions/ActionTypes'

const initial_state: QuestState = {};

export function quest(state: QuestState = initial_state, action: Redux.Action): QuestState {
  switch (action.type) {
    case 'QUEST_NODE':
      return {...state,
        details: (action as QuestNodeAction).details || state.details,
        node: (action as QuestNodeAction).node,
      };
    default:
      return state;
  }
}

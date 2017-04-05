import Redux from 'redux'
import {QuestState, AppState} from './StateTypes'
import {QuestNodeAction, InitCombatAction} from '../actions/ActionTypes'

const initial_state: QuestState = {};

export function quest(state: QuestState = initial_state, action: Redux.Action): QuestState {
  switch (action.type) {
    case 'QUEST_NODE':
      return {...state,
        details: (action as QuestNodeAction).details || state.details,
        node: (action as QuestNodeAction).node,
      };
    case 'INIT_COMBAT':
      return {...state,
        node: (action as InitCombatAction).node,
      };
    default:
      return state;
  }
}

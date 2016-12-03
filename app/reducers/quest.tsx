import {QuestState, AppState} from './StateTypes'
import {QuestNodeAction, InitCombatAction} from '../actions/ActionTypes'

export function quest(state: QuestState, action: Redux.Action): QuestState {
  switch (action.type) {
    case 'QUEST_NODE':
      return {
        node: (action as QuestNodeAction).node,
        result: (action as QuestNodeAction).result,
      };
    case 'INIT_COMBAT':
      return {
        node: (action as InitCombatAction).node,
        result: (action as InitCombatAction).result,
      };
    default:
      return state;
  }
}
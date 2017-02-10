import {QuestState, AppState} from './StateTypes'
import {QuestNodeAction, InitCombatAction, UpdateFeedbackAction} from '../actions/ActionTypes'

export function quest(state: QuestState, action: Redux.Action): QuestState {
  switch (action.type) {
    case 'QUEST_NODE':
      return Object.assign({}, state, {
        details: (action as QuestNodeAction).details || state.details,
        node: (action as QuestNodeAction).node,
        result: (action as QuestNodeAction).result,
      });
    case 'INIT_COMBAT':
      return Object.assign({}, state, {
        node: (action as InitCombatAction).node,
        result: (action as InitCombatAction).result,
      });
    case 'UPDATE_FEEDBACK':
      return Object.assign({}, state, {
        feedback: Object.assign({},
          state.feedback,
          (action as UpdateFeedbackAction).feedback
        ),
      });
    default:
      return state;
  }
}

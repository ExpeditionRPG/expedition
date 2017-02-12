import {QuestState, AppState} from './StateTypes'
import {QuestNodeAction, InitCombatAction, UpdateFeedbackAction} from '../actions/ActionTypes'

const initial_state: QuestState = {
  feedback: {
    text: '',
  },
};

export function quest(state: QuestState = initial_state, action: Redux.Action): QuestState {
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

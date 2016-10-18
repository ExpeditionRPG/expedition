import {ReceiveQuestLoadAction, ReceiveQuestShareAction} from '../actions/ActionTypes'
import {QuestType} from './StateTypes'

const initial_state: QuestType = {};

export function quest(state: QuestType = initial_state, action: Redux.Action): QuestType {
  switch(action.type) {
    case 'RECEIVE_QUEST_LOAD':
      return (action as ReceiveQuestLoadAction).quest;
    case 'NEW_QUEST':
    case 'RECEIVE_QUEST_DELETE':
      return initial_state;
    case 'RECEIVE_QUEST_SHARE':
      let share_action = (action as ReceiveQuestShareAction);
      var now = (new Date()).getTime();
      switch(share_action.share) {
        case 'PRIVATE':
          return Object.assign({}, state, {shared: null, published: null});
        case 'UNLISTED':
          return Object.assign({}, state, {shared: now, published: null});
        case 'PUBLIC':
          return Object.assign({}, state, {shared: now, published: now});
      }
      return state;
    default:
      return state;
  }
}
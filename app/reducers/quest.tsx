import {ReceiveQuestLoadAction, ReceiveQuestSaveAction, ReceiveQuestPublishAction, ReceiveQuestUnpublishAction} from '../actions/ActionTypes'
import {QuestType} from './StateTypes'

const initial_state: QuestType = {};

export function quest(state: QuestType = initial_state, action: Redux.Action): QuestType {
  switch(action.type) {
    case 'RECEIVE_QUEST_LOAD':
      return (action as ReceiveQuestLoadAction).quest;
    case 'REALTIME_CHANGE':
      return Object.assign({}, state, {md: (action as any).text});
    case 'RECEIVE_QUEST_SAVE':
      return Object.assign({}, state, (action as ReceiveQuestSaveAction).quest);
    case 'RECEIVE_QUEST_PUBLISH':
      return Object.assign({}, state, (action as ReceiveQuestPublishAction).quest);
    case 'RECEIVE_QUEST_UNPUBLISH':
      return Object.assign({}, state, (action as ReceiveQuestUnpublishAction).quest);
    case 'NEW_QUEST':
      return initial_state;
    default:
      return state;
  }
}

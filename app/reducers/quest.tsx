import {RECEIVE_QUEST_LOAD, ReceiveQuestLoadAction, NEW_QUEST, RECEIVE_QUEST_DELETE, RECEIVE_QUEST_PUBLISH, ReceiveQuestPublishAction} from '../actions/ActionTypes'
import {QuestType} from './StateTypes'

const initial_state: QuestType = {};

export function quest(state: QuestType = initial_state, action: Redux.Action): QuestType {
  switch(action.type) {
    case RECEIVE_QUEST_LOAD:
      return (action as ReceiveQuestLoadAction).quest;
    case NEW_QUEST:
    case RECEIVE_QUEST_DELETE:
      return initial_state;
    case RECEIVE_QUEST_PUBLISH:
      let publish_action = (action as ReceiveQuestPublishAction);
      return Object.assign({}, state, {short_url: publish_action.short_url});
    default:
      return state;
  }
}
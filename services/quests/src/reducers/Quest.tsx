import Redux from 'redux';
import {QuestMetadataChangeAction, ReceiveQuestLoadAction, ReceiveQuestPublishAction, ReceiveQuestSaveAction, ReceiveQuestSaveErrAction, ReceiveQuestUnpublishAction} from '../actions/ActionTypes';
import {QuestType} from './StateTypes';

const initialQuestState: QuestType = {};

export function quest(state: QuestType = initialQuestState, action: Redux.Action): QuestType {
  switch (action.type) {
    case 'QUEST_METADATA_CHANGE':
      const key = (action as QuestMetadataChangeAction).key;
      const value = (action as QuestMetadataChangeAction).value;
      return {...state, [key]: value};
    case 'RECEIVE_QUEST_LOAD':
      return (action as ReceiveQuestLoadAction).quest;
    case 'REALTIME_CHANGE':
      return Object.assign({}, state, {md: (action as any).text});
    case 'RECEIVE_QUEST_SAVE':
      return Object.assign({}, state, {title: (action as ReceiveQuestSaveAction).meta.title}, {saveError: null});
    case 'RECEIVE_QUEST_SAVE_ERR':
      return Object.assign({}, state, {saveError: (action as ReceiveQuestSaveErrAction).err});
    case 'RECEIVE_QUEST_PUBLISH':
      return Object.assign({}, state, (action as ReceiveQuestPublishAction).quest);
    case 'RECEIVE_QUEST_UNPUBLISH':
      return Object.assign({}, state, (action as ReceiveQuestUnpublishAction).quest);
    case 'QUEST_LOADING':
      return initialQuestState;
    case 'NEW_QUEST':
      return initialQuestState;
    default:
      return state;
  }
}

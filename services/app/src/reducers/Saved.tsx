import Redux from 'redux';
import {SavedQuestListAction, SavedQuestSelectAction, StorageFreeAction} from '../actions/ActionTypes';
import {SavedQuestState} from './StateTypes';

const initialSavedState: SavedQuestState = {
  list: [],
  selectedTS: null,
  freeBytes: null,
};

export function saved(state: SavedQuestState = initialSavedState, action: Redux.Action): SavedQuestState {
  switch (action.type) {
    case 'SAVED_QUEST_DELETED':
    case 'SAVED_QUEST_LIST':
    case 'SAVED_QUEST_STORED':
      // All these actions have the same savedQuests signature
      return {...state, list: [...(action as SavedQuestListAction).savedQuests]};
    case 'SAVED_QUEST_SELECT':
      return {...state, selectedTS: (action as SavedQuestSelectAction).ts};
    case 'STORAGE_FREE':
      return {...state, freeBytes: (action as StorageFreeAction).freeBytes};
    default:
      return state;
  }
}

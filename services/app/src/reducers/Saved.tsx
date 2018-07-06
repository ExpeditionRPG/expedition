import Redux from 'redux';
import {PreviewQuestAction, SavedQuestListAction} from '../actions/ActionTypes';
import {SavedQuestState} from './StateTypes';

const initialSavedState: SavedQuestState = {
  list: [],
};

export function saved(state: SavedQuestState = initialSavedState, action: Redux.Action): SavedQuestState {
  switch (action.type) {
    case 'SAVED_QUEST_DELETED':
    case 'SAVED_QUEST_LIST':
    case 'SAVED_QUEST_STORED':
      // All these actions have the same savedQuests signature
      return {...state, list: [...(action as SavedQuestListAction).savedQuests]};
    default:
      return state;
  }
}

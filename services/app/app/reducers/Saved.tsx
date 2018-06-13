import Redux from 'redux'
import {SavedQuestState} from './StateTypes'
import {SavedQuestListAction, SavedQuestSelectedAction} from '../actions/ActionTypes'

const initialSavedState: SavedQuestState = {
  list: [],
  selected: null,
};

export function saved(state: SavedQuestState = initialSavedState, action: Redux.Action): SavedQuestState {
  switch (action.type) {
    case 'SAVED_QUEST_DELETED':
    case 'SAVED_QUEST_LIST':
    case 'SAVED_QUEST_STORED':
      // All these actions have the same savedQuests signature
      return {...state, list: [...(action as SavedQuestListAction).savedQuests]};
    case 'SAVED_QUEST_SELECTED':
      return {...state, selected: (action as SavedQuestSelectedAction).selected};
    default:
      return state;
  }
}

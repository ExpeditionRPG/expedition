import Redux from 'redux'
import {SavedQuestMeta, SavedQuestState} from './StateTypes'
import {SavedQuestListAction, SavedQuestSelectedAction} from '../actions/ActionTypes'

export function saved(state: SavedQuestState = {list: [], selected: null}, action: Redux.Action): SavedQuestState {
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

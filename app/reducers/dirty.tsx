import {RECEIVE_QUEST_SAVE, SET_DIRTY, SetDirtyAction, NEW_QUEST, RECEIVE_QUEST_DELETE} from '../actions/ActionTypes'
import {DirtyType} from './StateTypes'

export function dirty(state: DirtyType = false, action: Redux.Action): DirtyType {
  switch (action.type) {
    case SET_DIRTY:
      return (action as SetDirtyAction).is_dirty;
    case RECEIVE_QUEST_SAVE:
    case RECEIVE_QUEST_DELETE:
    case NEW_QUEST:
      return false;
    default:
      return state;
  }
}


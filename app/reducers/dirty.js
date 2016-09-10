import {RECEIVE_QUEST_SAVE, SET_DIRTY, NEW_QUEST, RECEIVE_QUEST_DELETE} from '../ActionTypes'

export function dirty(state = false, action) {
  switch (action.type) {
    case SET_DIRTY:
      return action.is_dirty;
    case RECEIVE_QUEST_SAVE:
    case RECEIVE_QUEST_DELETE:
    case NEW_QUEST:
      return false;
    default:
      return state;
  }
}


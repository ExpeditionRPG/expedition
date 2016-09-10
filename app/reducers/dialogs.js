import {DialogIDs, SET_DIALOG, NEW_QUEST, LOAD_QUEST, RECEIVE_QUEST_PUBLISH, SET_PROFILE_META} from '../ActionTypes'

export function dialogs(state = {
  [DialogIDs.USER]: false,
  [DialogIDs.ERROR]: false,
  [DialogIDs.CONFIRM_NEW_QUEST]: false,
  [DialogIDs.CONFIRM_LOAD_QUEST]: false,
  [DialogIDs.PUBLISH_QUEST]: false},
  action) {

  switch (action.type) {
    case SET_DIALOG:
      return {...state, [action.dialog]: action.shown};
    case NEW_QUEST:
      return {...state, [DialogIDs.CONFIRM_NEW_QUEST]: false};
    case LOAD_QUEST:
      return {...state, [DialogIDs.CONFIRM_LOAD_QUEST]: false};
    case RECEIVE_QUEST_PUBLISH:
      return {...state, [DialogIDs.PUBLISH_QUEST]: true};
    case SET_PROFILE_META:
      return {...state, [DialogIDs.USER]: false};
    default:
      return state;
  }
}

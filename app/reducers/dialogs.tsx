import {SetDialogAction, ReceiveQuestPublishAction, SET_DIALOG, NEW_QUEST, LOAD_QUEST, RECEIVE_QUEST_PUBLISH, SET_PROFILE_META} from '../actions/ActionTypes'
import {DialogsType} from './StateTypes'

const initial_state: DialogsType = {USER: false,  ERROR: false, CONFIRM_NEW_QUEST: false, CONFIRM_LOAD_QUEST: false, PUBLISH_QUEST: false};

export function dialogs(state: DialogsType = initial_state, action: Redux.Action): DialogsType {
  let new_state: DialogsType = Object.assign({}, state);
  switch (action.type) {
    case SET_DIALOG:
      let dialog_action = (action as SetDialogAction);
      new_state[dialog_action.dialog] = dialog_action.shown;
      return new_state;
    case NEW_QUEST:
      new_state.CONFIRM_NEW_QUEST = false;
      return new_state;
    case LOAD_QUEST:
      new_state.CONFIRM_LOAD_QUEST = false;
      return new_state;
    case RECEIVE_QUEST_PUBLISH:
      new_state.PUBLISH_QUEST = true;
      return new_state;
    case SET_PROFILE_META:
      new_state.USER = false;
      return new_state;
    default:
      return state;
  }
}

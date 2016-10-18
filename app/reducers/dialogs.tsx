import {SetDialogAction} from '../actions/ActionTypes'
import {DialogsState} from './StateTypes'

const initial_state: DialogsState = {USER: false,  ERROR: false, CONFIRM_NEW_QUEST: false, CONFIRM_LOAD_QUEST: false, SHARE_SETTINGS: false, PUBLISHED: false};

export function dialogs(state: DialogsState = initial_state, action: Redux.Action): DialogsState {
  let new_state: DialogsState = Object.assign({}, state);
  switch (action.type) {
    case 'SET_DIALOG':
      let dialog_action = (action as SetDialogAction);
      new_state[dialog_action.dialog] = dialog_action.shown;
      return new_state;
    case 'NEW_QUEST':
      new_state.CONFIRM_NEW_QUEST = false;
      return new_state;
    case 'LOAD_QUEST':
      new_state.CONFIRM_LOAD_QUEST = false;
      return new_state;
    case 'SET_PROFILE_META':
      new_state.USER = false;
      return new_state;
    case 'RECEIVE_QUEST_PUBLISH':
      new_state.PUBLISHED = true;
      return new_state;
    default:
      return state;
  }
}

import {SetDialogAction} from '../actions/ActionTypes'
import {DialogsState} from './StateTypes'

const initial_state: DialogsState = {USER: false,  ERROR: false, PUBLISHED: false, UNPUBLISHED: false};

export function dialogs(state: DialogsState = initial_state, action: Redux.Action): DialogsState {
  let new_state: DialogsState = Object.assign({}, state);
  switch (action.type) {
    case 'SET_DIALOG':
      let dialog_action = (action as SetDialogAction);
      new_state[dialog_action.dialog] = dialog_action.shown;
      return new_state;
    case 'RECEIVE_QUEST_PUBLISH':
      new_state.PUBLISHED = true;
      return new_state;
    case 'RECEIVE_QUEST_UNPUBLISH':
      new_state.UNPUBLISHED = true;
      return new_state;
    default:
      return state;
  }
}

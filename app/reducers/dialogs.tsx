import {SetDialogAction} from '../actions/ActionTypes'
import {DialogsState} from './StateTypes'

const initialState: DialogsState = {USER: false,  ERROR: false, PUBLISHED: false, UNPUBLISHED: false};

export function dialogs(state: DialogsState = initialState, action: Redux.Action): DialogsState {
  let newState: DialogsState = Object.assign({}, state);
  switch (action.type) {
    case 'SET_DIALOG':
      let dialog_action = (action as SetDialogAction);
      newState[dialog_action.dialog] = dialog_action.shown;
      return newState;
    case 'RECEIVE_QUEST_PUBLISH':
      newState.PUBLISHED = true;
      return newState;
    case 'RECEIVE_QUEST_UNPUBLISH':
      newState.UNPUBLISHED = true;
      return newState;
    default:
      return state;
  }
}

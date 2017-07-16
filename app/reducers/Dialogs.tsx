import Redux from 'redux'
import {SetDialogAction, PushErrorAction} from '../actions/ActionTypes'
import {DialogsState} from './StateTypes'

const initialState: DialogsState = {open: {USER: false,  ERROR: false, PUBLISHED: false, UNPUBLISHED: false}, errors: []};

export function dialogs(state: DialogsState = initialState, action: Redux.Action): DialogsState {
  let newState: DialogsState = {open: {...state.open}, errors: [...state.errors]};
  switch (action.type) {
    case 'SET_DIALOG':
      let dialog_action = (action as SetDialogAction);
      newState.open[dialog_action.dialog] = dialog_action.shown;

      // Clear errors when we hide the error dialog
      if (dialog_action.dialog === 'ERROR' && !dialog_action.shown) {
        newState.errors = [];
      }
      return newState;
    case 'QUEST_PUBLISHING_SETUP':
      newState.open.PUBLISHING = true;
      return newState;
    case 'PUSH_ERROR':
      let error_action = (action as PushErrorAction);
      newState.errors.push(error_action.error);

      // Always show the error dialog if there's errors to be shown.
      newState.open['ERROR'] = true;
      return newState;
    default:
      return state;
  }
}

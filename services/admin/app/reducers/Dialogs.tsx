import Redux from 'redux'
import {SetDialogAction} from '../actions/ActionTypes'
import {DialogsState} from './StateTypes'

const initialState: DialogsState = {
  open: 'NONE',
};

export function dialogs(state: DialogsState = initialState, action: Redux.Action): DialogsState {
  let newState: DialogsState = {...state};
  switch (action.type) {
    case 'SET_DIALOG':
      let dialog_action = (action as SetDialogAction);
      newState.open = dialog_action.dialog;
      return newState;
    default:
      return state;
  }
}

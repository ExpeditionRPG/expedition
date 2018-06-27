import Redux from 'redux';
import {SetDialogAction} from '../actions/ActionTypes';
import {DialogsState} from './StateTypes';

const initialState: DialogsState = {
  open: 'NONE',
};

export function dialogs(state: DialogsState = initialState, action: Redux.Action): DialogsState {
  switch (action.type) {
    case 'SET_DIALOG':
      const dialogAction = (action as SetDialogAction);
      return {...state, open: dialogAction.dialog};
    default:
      return state;
  }
}

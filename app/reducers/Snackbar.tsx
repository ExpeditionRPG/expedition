import Redux from 'redux'
import {SnackbarOpenAction} from '../actions/ActionTypes'
import {SnackbarState} from './StateTypes'

const default_state: SnackbarState = {
  open: false,
  message: '',
  timeout: 4000,
};

export function snackbar(state: SnackbarState = default_state, action: Redux.Action): SnackbarState {
  switch(action.type) {
    case 'SNACKBAR_OPEN':
      const openAction = (action as SnackbarOpenAction);
      return {
        open: true,
        message: openAction.message,
        timeout: openAction.timeout || 4000,
      };
    case 'SNACKBAR_CLOSE':
      return {...default_state};
    default:
      return state;
  }
}

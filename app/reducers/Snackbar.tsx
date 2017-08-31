import Redux from 'redux'
import {SnackbarOpenAction} from '../actions/ActionTypes'
import {SnackbarState} from './StateTypes'

export const initialState: SnackbarState = {
  open: false,
  message: '',
  timeout: 4000,
};

export function snackbar(state: SnackbarState = initialState, action: Redux.Action): SnackbarState {
  switch(action.type) {
    case 'SNACKBAR_OPEN':
      const openAction = (action as SnackbarOpenAction);
      if (openAction.message && openAction.message !== '') {
        return {
        open: true,
        message: openAction.message,
        timeout: openAction.timeout || initialState.timeout,
      };
      }
    case 'SNACKBAR_CLOSE':
      return {...initialState};
    default:
      return state;
  }
}

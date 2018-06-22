import Redux from 'redux'
import {SnackbarSetAction} from '../actions/ActionTypes'
import {SnackbarState} from './StateTypes'

const default_state: SnackbarState = {
  open: false,
};

export function snackbar(state: SnackbarState = default_state, action: Redux.Action): SnackbarState {
  switch(action.type) {
    case 'SNACKBAR_SET':
      const setAction = (action as SnackbarSetAction);
      return {
        open: setAction.open,
        message: setAction.message,
        actions: setAction.actions,
        persist: setAction.persist,
      };
    default:
      return state;
  }
}

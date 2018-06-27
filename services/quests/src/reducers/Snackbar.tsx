import Redux from 'redux';
import {SnackbarSetAction} from '../actions/ActionTypes';
import {SnackbarState} from './StateTypes';

const initialSnackbarState: SnackbarState = {
  message: '',
  open: false,
};

export function snackbar(state: SnackbarState = initialSnackbarState, action: Redux.Action): SnackbarState {
  switch (action.type) {
    case 'SNACKBAR_SET':
      const setAction = (action as SnackbarSetAction);
      return {
        action: setAction.action,
        actionLabel: setAction.actionLabel,
        message: setAction.message,
        open: setAction.open,
        persist: setAction.persist,
      };
    default:
      return state;
  }
}

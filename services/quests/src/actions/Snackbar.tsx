import {SnackbarSetAction} from './ActionTypes';

export function setSnackbar(open: boolean, message?: string, action?: any, actionLabel?: string, persist?: boolean): SnackbarSetAction {
  return {type: 'SNACKBAR_SET', open, message, action, actionLabel, persist};
}

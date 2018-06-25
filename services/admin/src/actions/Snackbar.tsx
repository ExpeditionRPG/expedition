import {SnackbarSetAction} from './ActionTypes';

export function setSnackbar(open: boolean, message?: JSX.Element, actions?: JSX.Element[], persist?: boolean): SnackbarSetAction {
  return {type: 'SNACKBAR_SET', open, message, actions, persist};
}

import {SnackbarCloseAction, SnackbarOpenAction} from './ActionTypes'
import {setDialog} from './Dialog'
import {getAppVersion, getDevicePlatform} from '../Globals'
import {getStore} from '../Store'

export function closeSnackbar(): SnackbarCloseAction {
  return {type: 'SNACKBAR_CLOSE'};
}

export function openSnackbar(message: string, errorMessage?: string): SnackbarOpenAction {
  const action = {type: 'SNACKBAR_OPEN', message} as SnackbarOpenAction;
  if (errorMessage) {
    action.actionLabel = 'Report';
    action.action = () => {
      return getStore().dispatch(setDialog('REPORT_ERROR', errorMessage));
    };
  }
  return action;
}

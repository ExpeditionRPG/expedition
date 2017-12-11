import {SnackbarCloseAction, SnackbarOpenAction} from './ActionTypes'
import {getAppVersion, getDevicePlatform} from '../Globals'
import {getStore} from '../Store'

declare var window:any;

export function closeSnackbar(): SnackbarCloseAction {
  return {type: 'SNACKBAR_CLOSE'};
}

export function openSnackbar(message: string, errorMessage?: string): SnackbarOpenAction {
  const action = {type: 'SNACKBAR_OPEN', message} as SnackbarOpenAction;
  if (errorMessage) {
    action.actionLabel = 'Report';
    const quest = getStore().getState().quest.details || {};
    const subject = encodeURIComponent(`App error: ${getDevicePlatform()} v${getAppVersion()}`);
    const body = encodeURIComponent(`Error: ${errorMessage}. Quest: ${quest.title} (ID: ${quest.id})`);
    action.action = () => {
      window.open(`mailto:expedition@fabricate.io?subject=${subject}&body=${body}`, '_system');
    };
  }
  return action;
}

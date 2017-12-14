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
    const email = 'expedition@fabricate.io';
    const subject = `App error: ${getDevicePlatform()} v${getAppVersion()}`;
    const body = `Error: ${errorMessage}. Quest: ${quest.title} (ID: ${quest.id})`;
    action.action = () => {
      if (window.plugin && window.plugin.email) {
        window.plugin.email.isAvailable((hasAccount: boolean) => {
          window.plugin.email.open({
            to: [email],
            subject,
            body,
          });
        });
      } else {
        openEmailLink(email, subject, body);
      }
    };
  }
  return action;
}

function openEmailLink(email: string, subject: string, body: string) {
  window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_system');
}

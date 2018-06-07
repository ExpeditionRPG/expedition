import {SnackbarCloseAction, SnackbarOpenAction} from './ActionTypes'
import {setDialog} from './Dialog'
import {getStore} from '../Store'

export function closeSnackbar(): SnackbarCloseAction {
  return {type: 'SNACKBAR_CLOSE'};
}

export function openSnackbar(message: string|Error): SnackbarOpenAction {
  if (message instanceof Error) {
    return {
      type: 'SNACKBAR_OPEN',
      message: 'Error! Please send feedback.',
      actionLabel: 'Report',
      action: () => {
        return getStore().dispatch(setDialog('REPORT_ERROR', message.toString()));
      },
    };
  }
  return {
    type: 'SNACKBAR_OPEN',
    message: message,
  };
}

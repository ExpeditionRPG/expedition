import {getStore} from '../Store';
import {SnackbarCloseAction, SnackbarOpenAction} from './ActionTypes';
import {setDialog} from './Dialog';

export function closeSnackbar(): SnackbarCloseAction {
  return {type: 'SNACKBAR_CLOSE'};
}

export function openSnackbar(message: string|Error): SnackbarOpenAction {
  if (message instanceof Error) {
    return {
      action: () => {
        return getStore().dispatch(setDialog('REPORT_ERROR', message.toString()));
      },
      actionLabel: 'Report',
      message: 'Error! Please send feedback.',
      type: 'SNACKBAR_OPEN',
    };
  }
  return {
    message,
    type: 'SNACKBAR_OPEN',
  };
}

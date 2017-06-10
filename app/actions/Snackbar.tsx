import {SnackbarCloseAction, SnackbarOpenAction} from './ActionTypes'

export function closeSnackbar(): SnackbarCloseAction {
  return {type: 'SNACKBAR_CLOSE'};
}

export function openSnackbar(message: string, timeout?: number): SnackbarOpenAction {
  return {type: 'SNACKBAR_OPEN', message, timeout};
}

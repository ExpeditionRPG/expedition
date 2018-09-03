import {DialogIDType} from '../reducers/StateTypes';
import {PushErrorAction, SetDialogAction} from './ActionTypes';

const ReactGA = require('react-ga');

export function setDialog(dialog: DialogIDType, shown: boolean, annotations?: number[]): SetDialogAction {
  return {type: 'SET_DIALOG', dialog, shown, annotations};
}

export function pushHTTPError(err: {statusText: string, status: string, responseText: string}): PushErrorAction {
  const error = new Error(err.responseText);
  error.name = err.statusText + ' (' + err.status + ')';
  return pushError(error);
}

export function pushError(error: Error): PushErrorAction {
  ReactGA.event({
    action: error.name + ': ' + error.message,
    category: 'Error',
    label: error.name,
  });
  return {type: 'PUSH_ERROR', error};
}

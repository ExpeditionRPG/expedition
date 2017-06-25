import {SetDialogAction, PushErrorAction} from './ActionTypes'
import {DialogIDType} from '../reducers/StateTypes'

const ReactGA = require('react-ga') as any;

export function setDialog(dialog: DialogIDType, shown: boolean): SetDialogAction {
  return {type: 'SET_DIALOG', dialog, shown};
}

export function pushHTTPError(err: {statusText: string, status: string, responseText: string}): PushErrorAction {
  const error = new Error(err.responseText);
  error.name = err.statusText + ' (' + err.status + ')';
  return pushError(error);
}

export function pushError(error: Error): PushErrorAction {
  ReactGA.event({
    category: 'Error',
    action: error.name + ': ' + error.message,
    label: error.name,
  });
  return {type: 'PUSH_ERROR', error};
}

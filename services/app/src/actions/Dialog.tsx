import {DialogIDType} from '../reducers/StateTypes';
import {DialogSetAction} from './ActionTypes';

export function setDialog(dialogID: DialogIDType, message?: string): DialogSetAction {
  return {
    dialogID,
    message,
    type: 'DIALOG_SET',
  };
}

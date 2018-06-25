import {DialogIDType} from '../reducers/StateTypes';
import {DialogSetAction} from './ActionTypes';

export function setDialog(dialogID: DialogIDType, message?: string): DialogSetAction {
  return {
    type: 'DIALOG_SET',
    dialogID,
    message,
  };
}

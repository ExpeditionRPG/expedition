import {DialogSetAction} from './ActionTypes'
import {DialogIDType} from '../reducers/StateTypes'

export function setDialog(dialogID: DialogIDType, message?: string): DialogSetAction {
  return {type: 'DIALOG_SET', dialogID, message};
}

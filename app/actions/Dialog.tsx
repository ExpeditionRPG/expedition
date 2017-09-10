import {DialogSetAction} from './ActionTypes'
import {DialogIDType} from '../reducers/StateTypes'

export function setDialog(dialogID: DialogIDType): DialogSetAction {
  return {type: 'DIALOG_SET', dialogID};
}

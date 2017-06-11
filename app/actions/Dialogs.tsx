import {SetDialogAction} from './ActionTypes'
import {DialogIDType} from '../reducers/StateTypes'

export function setDialog(dialog: DialogIDType, shown: boolean): SetDialogAction {
  return {type: 'SET_DIALOG', dialog, shown};
}

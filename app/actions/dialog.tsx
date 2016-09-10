import {DialogIDType, SET_DIALOG} from './ActionTypes'

export function setDialog(dialog: DialogIDType, shown: boolean) {
  return {type: SET_DIALOG, dialog, shown};
}

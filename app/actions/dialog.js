import {SET_DIALOG} from '../ActionTypes'

export function setDialog(dialog, shown) {
  return {type: SET_DIALOG, dialog, shown};
}
import {SetDialogAction} from './ActionTypes'
import {DialogIDType} from '../reducers/StateTypes'
import {MARKDOWN_GUIDE_URL} from '../constants'

export function setDialog(dialog: DialogIDType, shown: boolean): SetDialogAction {
  return {type: 'SET_DIALOG', dialog, shown};
}

export function showHelp() {
  return (dispatch: Redux.Dispatch<any>): any => {
    window.open(MARKDOWN_GUIDE_URL, '_blank');
  }
}
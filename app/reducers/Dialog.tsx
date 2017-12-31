import * as React from 'react'
import Redux from 'redux'
import {DialogSetAction} from '../actions/ActionTypes'
import {DialogState} from './StateTypes'

export const initialDialog: DialogState = {
  open: null,
  message: '',
};

export function dialog(state: DialogState = initialDialog, action: Redux.Action): DialogState {
  switch(action.type) {
    case 'DIALOG_SET':
      const setAction = (action as DialogSetAction);
      return {
        ...state,
        open: setAction.dialogID,
        message: setAction.message,
      };
    default:
      return state;
  }
}

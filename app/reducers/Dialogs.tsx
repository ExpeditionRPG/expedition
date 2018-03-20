import Redux from 'redux'
import {SetDialogAction} from '../actions/ActionTypes'
import {DialogsState} from './StateTypes'

const initialState: DialogsState = {
  open: {
    USER: false,
    ERROR: false,
    PUBLISHED: false,
    UNPUBLISHED: false,
    ANNOTATION_DETAIL: false,
  },
  drawer: false,
};

export function dialogs(state: DialogsState = initialState, action: Redux.Action): DialogsState {
  let newState: DialogsState = {
    open: {...state.open},
    drawer: state.drawer,
  };
  switch (action.type) {
    case 'SET_DIALOG':
      let dialog_action = (action as SetDialogAction);
      newState.open[dialog_action.dialog] = dialog_action.shown;
      return newState;
    case 'TOGGLE_DRAWER':
      newState.drawer = !newState.drawer;
      return newState;
    default:
      return state;
  }
}

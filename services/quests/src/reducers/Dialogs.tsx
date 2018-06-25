import Redux from 'redux';
import errors from '../../errors/errors';
import {PushErrorAction, SetDialogAction} from '../actions/ActionTypes';
import {DialogsState} from './StateTypes';

const initialState: DialogsState = {
  open: {
    USER: false,
    ERROR: false,
    PUBLISHED: false,
    UNPUBLISHED: false,
    ANNOTATION_DETAIL: false,
  },
  errors: [],
  annotations: [],
};

export function dialogs(state: DialogsState = initialState, action: Redux.Action): DialogsState {
  const newState: DialogsState = {
    open: {...state.open},
    errors: [...state.errors],
    annotations: state.annotations,
  };
  switch (action.type) {
    case 'SET_DIALOG':
      const dialogAction = (action as SetDialogAction);
      newState.open[dialogAction.dialog] = dialogAction.shown;

      // Clear errors when we hide the error dialog
      if (dialogAction.dialog === 'ERROR' && !dialogAction.shown) {
        newState.errors = [];
      }

      // Assign the appropriate error details when showing annotation details dialog
      if (dialogAction.dialog === 'ANNOTATION_DETAIL') {
        if (dialogAction.shown && dialogAction.annotations) {
          newState.annotations = dialogAction.annotations.map((a: number) =>errors[a] || a);
        } else {
          newState.annotations = [];
        }
      }

      return newState;
    case 'QUEST_PUBLISHING_SETUP':
      newState.open.PUBLISHING = true;
      return newState;
    case 'PUSH_ERROR':
      const errorAction = (action as PushErrorAction);
      newState.errors.push(errorAction.error);

      // Always show the error dialog if there's errors to be shown.
      newState.open.ERROR = true;
      return newState;
    default:
      return state;
  }
}

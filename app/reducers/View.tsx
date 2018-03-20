import Redux from 'redux'
import {SetViewAction} from '../actions/ActionTypes'
import {ViewState} from './StateTypes'

export const defaultView: ViewState = {
  view: 'FEEDBACK',
};

export function view(state: ViewState = defaultView, action: Redux.Action): ViewState {
  switch(action.type) {
    case 'SET_VIEW':
      return {...state, view: (action as SetViewAction).view};      
    default:
      return state;
  }
}

import Redux from 'redux'
import {UserFeedbackState} from './StateTypes'
import {UserFeedbackChangeAction} from '../actions/ActionTypes'

const initialState: UserFeedbackState = {
  type: 'rating',
  text: '',
};

export function userFeedback(state: UserFeedbackState = initialState, action: Redux.Action): UserFeedbackState {
  switch (action.type) {
    case 'USER_FEEDBACK_CHANGE':
      return {...state, ...(action as UserFeedbackChangeAction).userFeedback};
    case 'USER_FEEDBACK_CLEAR':
      return {...initialState};
    default:
      return state;
  }
}

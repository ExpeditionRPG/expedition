import Redux from 'redux';
import {loggedOutUser} from 'shared/auth/UserState';
import {UserBadgesAction, UserFeedbacksAction, UserLoginAction} from '../actions/ActionTypes';
import {UserState} from './StateTypes';

export function user(state: UserState = loggedOutUser, action: Redux.Action): UserState {
  switch (action.type) {
    case 'USER_LOGIN':
      return (action as UserLoginAction).user;
    case 'USER_LOGOUT':
      return loggedOutUser;
    case 'USER_FEEDBACKS':
      return {...state, feedbacks: (action as UserFeedbacksAction).feedbacks};
    case 'USER_BADGES':
      return {...state, badges: (action as UserBadgesAction).badges};
    default:
      return state;
  }
}

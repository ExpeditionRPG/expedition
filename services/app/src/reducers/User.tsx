import Redux from 'redux';
import {UserFeedbacksAction, UserLoginAction} from '../actions/ActionTypes';
import {UserState} from './StateTypes';

export const loggedOutUser: UserState = {
  email: '',
  id: '',
  image: '',
  loggedIn: false,
  name: '',
  lastLogin: new Date(),
  loginCount: 0,
  lootPoints: 0,
};

export function user(state: UserState = loggedOutUser, action: Redux.Action): UserState {
  switch (action.type) {
    case 'USER_LOGIN':
      return (action as UserLoginAction).user;
    case 'USER_LOGOUT':
      return loggedOutUser;
    case 'USER_FEEDBACKS':
      return {...state, feedbacks: (action as UserFeedbacksAction).feedbacks};
    default:
      return state;
  }
}

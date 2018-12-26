import Redux from 'redux';
import { UserFeedbacksAction, UserLoginAction } from '../actions/ActionTypes';
import { UserState } from './StateTypes';

export const loggedOutUser: UserState = {
  lastLogin: new Date(),
  loginCount: 1,
  name: 'Saumya Tiwari',
  email: 'saumyatiwari.29@gmail.com',
  id: '100640728843297963982',
  image:
    'https://lh3.googleusercontent.com/-vCklp13LiDA/AAAAAAAAAAI/AAAAAAAAALc/nEBjkdkvBdg/photo.jpg?sz=50',
  loggedIn: true,
  lootPoints: 200,
};

export function user(
  state: UserState = loggedOutUser,
  action: Redux.Action
): UserState {
  switch (action.type) {
    case 'USER_LOGIN':
      return (action as UserLoginAction).user;
    case 'USER_LOGOUT':
      return loggedOutUser;
    case 'USER_FEEDBACKS':
      return { ...state, feedbacks: (action as UserFeedbacksAction).feedbacks };
    default:
      return state;
  }
}

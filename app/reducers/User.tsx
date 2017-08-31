import Redux from 'redux'
import {UserState} from './StateTypes'
import {UserLoginAction} from '../actions/ActionTypes'

export const initialUser: UserState = {
  loggedIn: false,
  id: '',
  name: '',
  image: '',
  email: '',
};

export function user(state: UserState = initialUser, action: Redux.Action): UserState {
  switch (action.type) {
    case 'USER_LOGIN':
      return (action as UserLoginAction).user;
    case 'USER_LOGOUT':
      return initialUser;
    default:
      return state;
  }
}

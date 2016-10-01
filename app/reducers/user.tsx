import {UserState} from './StateTypes'
import {UserLoginAction, UserLogoutAction} from '../actions/ActionTypes'

const initial_state: UserState = {
  loggedIn: false,
  id: "",
  name: "",
  image: "",
};

export function user(state: UserState = initial_state, action: Redux.Action): UserState {
  switch (action.type) {
    case 'USER_LOGIN':
      return (action as UserLoginAction).user;
    case 'USER_LOGOUT':
      return initial_state;
    default:
      return state;
  }
}
import Redux from 'redux'
import {UserState} from './StateTypes'
import {UserLoginAction, UserQuestsAction} from '../actions/ActionTypes'

export const loggedOutUser: UserState = {
  loggedIn: false,
  id: '',
  name: '',
  image: '',
  email: '',
  quests: {},
};

export function user(state: UserState = loggedOutUser, action: Redux.Action): UserState {
  switch (action.type) {
    case 'USER_LOGIN':
      return (action as UserLoginAction).user;
    case 'USER_QUESTS':
      return {...state, quests: (action as UserQuestsAction).quests};
    default:
      return state;
  }
}

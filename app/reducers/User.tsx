import Redux from 'redux'
import {SetProfileMetaAction} from '../actions/ActionTypes'
import {UserState} from './StateTypes'

export const loggedOutUser: UserState = {
  loggedIn: false,
  id: '',
  displayName: '',
  image: '',
  email: '',
  lootPoints: 0,
};

export function user(state: UserState = loggedOutUser, action: Redux.Action): UserState {
  switch(action.type) {
    case 'SET_PROFILE_META':
      const profileAction = (action as SetProfileMetaAction);
      return {
        loggedIn: profileAction.user.loggedIn,
        id: profileAction.user.id,
        displayName: profileAction.user.displayName,
        image: profileAction.user.image,
        email: profileAction.user.email,
        lootPoints: profileAction.user.lootPoints,
      };
    default:
      return state;
  }
}

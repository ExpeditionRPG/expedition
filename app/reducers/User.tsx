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
      let profile_action = (action as SetProfileMetaAction);
      return {
        loggedIn: profile_action.user.loggedIn,
        id: profile_action.user.id,
        displayName: profile_action.user.displayName,
        image: profile_action.user.image,
        email: profile_action.user.email,
        lootPoints: profile_action.user.lootPoints,
      };
    default:
      return state;
  }
}

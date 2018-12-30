import Redux from 'redux';
import {SetProfileMetaAction} from '../actions/ActionTypes';
import {UserState} from './StateTypes';

export const loggedOutUser: UserState = {
  displayName: '',
   email: '',
   id: '',
   image: '',
   loggedIn: false,
   lootPoints: 0,
};

export function user(state: UserState = loggedOutUser, action: Redux.Action): UserState {
  switch (action.type) {
    case 'SET_PROFILE_META':
      const profileAction = (action as SetProfileMetaAction);
      return {
        displayName: profileAction.user.displayName,
        email: profileAction.user.email,
        id: profileAction.user.id,
        image: profileAction.user.image,
        loggedIn: profileAction.user.loggedIn,
        lootPoints: profileAction.user.lootPoints,
      };
    default:
      return state;
  }
}

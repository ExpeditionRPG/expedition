import Redux from 'redux';
import {SetProfileMetaAction} from '../actions/ActionTypes';
import {UserState} from './StateTypes';

export const loggedOutUser: UserState = {
  displayName: 'Saumya Tiwari',
  email: 'saumyatiwari.29@gmail.com',
  id: '100640728843297963982',
  image: 'https://lh3.googleusercontent.com/-vCklp13LiDA/AAAAAAAAAAI/AAAAAAAAALc/nEBjkdkvBdg/photo.jpg?sz=50',
  loggedIn: true,
  lootPoints: 500,
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

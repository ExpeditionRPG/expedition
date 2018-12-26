import Redux from 'redux';
import { SetProfileMetaAction } from '../actions/ActionTypes';
import { UserState } from './StateTypes';

export const loggedOutUser: UserState = {
  displayName: 'Saumya',
  email: 'saumyatiwari.29@gmail.com',
  id: '100640728843297963982',
  image: 'https://lh3.googleusercontent…jpg?sz=50',
  loggedIn: true,
};

export function user(
  state: UserState = loggedOutUser,
  action: Redux.Action,
): UserState {
  switch (action.type) {
    case 'SET_PROFILE_META':
      const profileAction = action as SetProfileMetaAction;
      return {
        displayName: profileAction.user.displayName,
        email: profileAction.user.email,
        id: profileAction.user.id,
        image: profileAction.user.image,
        loggedIn: profileAction.user.loggedIn,
      };
    default:
      return state;
  }
}

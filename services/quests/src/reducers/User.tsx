import Redux from 'redux';
import {loggedOutUser as lOU, UserState} from 'shared/auth/UserState';
import {SetProfileMetaAction} from '../actions/ActionTypes';

export const loggedOutUser = lOU;

export function user(state: UserState = loggedOutUser, action: Redux.Action): UserState {
  switch (action.type) {
    case 'SET_PROFILE_META':
      const profileAction = (action as SetProfileMetaAction);
      return {...profileAction.user};
    default:
      return state;
  }
}

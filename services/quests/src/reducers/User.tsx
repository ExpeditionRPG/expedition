import Redux from 'redux';
import {loggedOutUser, UserState} from 'shared/auth/UserState';
import {SetProfileMetaAction} from '../actions/ActionTypes';

export function user(state: UserState = loggedOutUser, action: Redux.Action): UserState {
  switch (action.type) {
    case 'SET_PROFILE_META':
      const profileAction = (action as SetProfileMetaAction);
      return {...profileAction.user};
    default:
      return state;
  }
}

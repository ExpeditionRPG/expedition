import {SET_PROFILE_META, SetProfileMetaAction} from '../actions/ActionTypes'
import {UserType} from './StateTypes'

const default_state: UserType = {profile: null, login: null, logout: null};

export function user(state: UserType = default_state, action: Redux.Action): UserType {
  switch(action.type) {
    case SET_PROFILE_META:
      let profile_action = (action as SetProfileMetaAction);
      return {
        profile: profile_action.user.profile,
        login: profile_action.user.login || state.login,
        logout: profile_action.user.logout || state.logout
      };
    default:
      return state;
  }
}
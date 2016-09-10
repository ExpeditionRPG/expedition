import {SET_PROFILE_META} from '../ActionTypes'

export function user(state = {profile: null, login: null, logout: null}, action) {
  switch(action.type) {
    case SET_PROFILE_META:
      return {
        profile: action.profile,
        login: action.login || state.login,
        logout: action.logout || state.logout
      };
    default:
      return state;
  }
}
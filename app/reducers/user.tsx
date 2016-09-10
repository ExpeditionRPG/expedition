import {SET_PROFILE_META} from '../actions/ActionTypes'

export function user(state: any = {profile: null, login: null, logout: null}, action: any): any {
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
import {SET_PROFILE_META, SetProfileMetaAction} from '../actions/ActionTypes'
import {UserType} from './StateTypes'

const default_state: UserType = {id: null, displayName: null, image: null};

export function user(state: UserType = default_state, action: Redux.Action): UserType {
  switch(action.type) {
    case SET_PROFILE_META:
      let profile_action = (action as SetProfileMetaAction);
      return {
        id: profile_action.user.id,
        displayName: profile_action.user.displayName,
        image: profile_action.user.image
      };
    default:
      return state;
  }
}
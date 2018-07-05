import merge from 'deepmerge';
import Redux from 'redux';
import {UserLoginAction, UserQuestsAction, UserQuestsDeltaAction} from '../actions/ActionTypes';
import {UserState} from './StateTypes';

export const loggedOutUser: UserState = {
  email: '',
  id: '',
  image: '',
  loggedIn: false,
  name: '',
  quests: {},
};

export function user(state: UserState = loggedOutUser, action: Redux.Action): UserState {
  switch (action.type) {
    case 'USER_LOGIN':
      return (action as UserLoginAction).user;
    case 'USER_QUESTS':
      return {...state, quests: (action as UserQuestsAction).quests};
    case 'USER_QUESTS_DELTA':
      const delta = (action as UserQuestsDeltaAction).delta;
      return merge(state, {quests: delta}) as UserState;
    default:
      return state;
  }
}

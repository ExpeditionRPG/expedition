import merge from 'deepmerge';
import Redux from 'redux';
import {UserQuestsAction, UserQuestsDeltaAction} from '../actions/ActionTypes';
import {UserQuestsState} from './StateTypes';

const initialUserQuests: UserQuestsState = {
  history: {},
};

export function userquests(state: UserQuestsState = initialUserQuests, action: Redux.Action): UserQuestsState {
  switch (action.type) {
    case 'USER_QUESTS':
      const a = (action as UserQuestsAction);
      return {...state, history: a.quests};
    case 'USER_QUESTS_DELTA':
      const delta = (action as UserQuestsDeltaAction).delta;
      return merge(state, {history: delta}) as UserQuestsState;
    default:
      return state;
  }
}

import merge from 'deepmerge';
import Redux from 'redux';
import {UserQuestInstanceSelect, UserQuestsAction, UserQuestsDeltaAction} from '../actions/ActionTypes';
import {UserQuestHistory} from './StateTypes';

const initialHistoryState: UserQuestHistory = {
  list: {},
};

export function questhistory(state: UserQuestHistory = initialHistoryState, action: Redux.Action): UserQuestHistory {
  switch (action.type) {
    case 'USER_QUESTS':
      return {...state, list: (action as UserQuestsAction).quests};
    case 'USER_QUESTS_DELTA':
      const delta = (action as UserQuestsDeltaAction).delta;
      return merge(state, {list: delta}) as UserQuestHistory;
    default:
      return state;
  }
}

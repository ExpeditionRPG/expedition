import Redux from 'redux';
import {UserQuestInstance, UserQuestsType} from '../reducers/StateTypes';
import {
  UserQuestInstanceSelect,
  UserQuestsDeltaAction,
} from './ActionTypes';

export function userQuestsDelta(delta: Partial<UserQuestsType>) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch({type: 'USER_QUESTS_DELTA', delta} as UserQuestsDeltaAction);
  };
}

export function selectPlayedQuest(selected: UserQuestInstance) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch({type: 'USER_QUEST_INSTANCE_SELECT', selected} as UserQuestInstanceSelect);
  };
}

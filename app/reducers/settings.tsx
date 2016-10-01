import {SettingsType} from './StateTypes'
import {ChangeSettingAction} from '../actions/ActionTypes'

const initial_state: SettingsType = {numPlayers: 0, difficulty: 'EASY', viewMode: 'BEGINNER'};

export function settings(state: SettingsType = initial_state, action: Redux.Action): SettingsType {
  if (action.type !== 'CHANGE_SETTING') {
    return state;
  }

  let changeAction = (action as ChangeSettingAction);
  switch(changeAction.name) {
    case 'numPlayers':
      return Object.assign({}, state, {numPlayers: (changeAction.value as number)});
  }
  return state;
}
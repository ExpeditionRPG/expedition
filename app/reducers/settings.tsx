import Redux from 'redux'
import {SettingsType} from './StateTypes'
import {ChangeSettingsAction} from '../actions/ActionTypes'

const initial_state: SettingsType = {
  difficulty: 'NORMAL',
  multitouch: true,
  numPlayers: 1,
  showHelp: true,
  vibration: true
};

export function settings(state: SettingsType = initial_state, action: Redux.Action): SettingsType {
  if (action.type === 'CHANGE_SETTINGS') {
    return Object.assign({}, state, (action as ChangeSettingsAction).settings);
  }
  return state;
}

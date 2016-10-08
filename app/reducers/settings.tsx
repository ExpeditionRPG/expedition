import {SettingsType} from './StateTypes'
import {ChangeSettingsAction} from '../actions/ActionTypes'

const initial_state: SettingsType = {numPlayers: 1, difficulty: 'NORMAL', showHelp: true, multitouch: true};

export function settings(state: SettingsType = initial_state, action: Redux.Action): SettingsType {
  if (action.type !== 'CHANGE_SETTINGS') {
    return state;
  }

  return Object.assign({}, state, (action as ChangeSettingsAction).settings);
}
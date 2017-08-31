import Redux from 'redux'
import {SettingsType} from './StateTypes'
import {ChangeSettingsAction} from '../actions/ActionTypes'

export const initialSettings: SettingsType = {
  autoRoll: false,
  difficulty: 'NORMAL',
  fontSize: 'NORMAL',
  multitouch: true,
  numPlayers: 1,
  showHelp: true,
  timerSeconds: 10,
  vibration: true,
};

export function settings(state: SettingsType = initialSettings, action: Redux.Action): SettingsType {
  if (action.type === 'CHANGE_SETTINGS') {
    return {...state, ...(action as ChangeSettingsAction).settings};
  }
  return state;
}

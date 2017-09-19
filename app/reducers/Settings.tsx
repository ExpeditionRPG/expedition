import Redux from 'redux'
import {DifficultyType, FontSizeType, SettingsType} from './StateTypes'
import {ChangeSettingsAction} from '../actions/ActionTypes'
import {getStorageKeyBoolean, getStorageKeyNumber, getStorageKeyString, setStorageKey} from '../Globals'

export const initialSettings: SettingsType = {
  autoRoll: getStorageKeyBoolean('autoRoll', false),
  difficulty: getStorageKeyString('difficulty', 'NORMAL') as DifficultyType,
  fontSize: getStorageKeyString('fontSize', 'NORMAL') as FontSizeType,
  multitouch: getStorageKeyBoolean('multitouch', true),
  numPlayers: getStorageKeyNumber('numPlayers', 1),
  showHelp: getStorageKeyBoolean('showHelp', true),
  timerSeconds: getStorageKeyNumber('timerSeconds', 10),
  vibration: getStorageKeyBoolean('vibration', true),
};

export function settings(state: SettingsType = initialSettings, action: Redux.Action): SettingsType {
  switch(action.type) {
    case 'CHANGE_SETTINGS':
      const changes = (action as ChangeSettingsAction).settings;
      Object.keys(changes).forEach((key: string) => {
        setStorageKey(key, changes[key]);
      });
      return {...state, ...changes};
    default:
      return state;
  }
}

import Redux from 'redux'
import {ContentSetsType, DifficultyType, FontSizeType, SettingsType} from './StateTypes'
import {ChangeSettingsAction} from '../actions/ActionTypes'
import {getStorageBoolean, getStorageJson, getStorageNumber, getStorageString, setStorageKeyValue} from '../Globals'

// TODO reduce redundancy by setting initial value to default,
// and then looping over with the getStorage based on key + type
export const initialSettings: SettingsType = {
  audioEnabled: getStorageBoolean('audioEnabled', true),
  autoRoll: getStorageBoolean('autoRoll', false),
  contentSets: getStorageJson('contentSets') as ContentSetsType || {
    horror: null,
  },
  difficulty: getStorageString('difficulty', 'NORMAL') as DifficultyType,
  fontSize: getStorageString('fontSize', 'NORMAL') as FontSizeType,
  multitouch: getStorageBoolean('multitouch', true),
  numPlayers: getStorageNumber('numPlayers', 1),
  showHelp: getStorageBoolean('showHelp', true),
  timerSeconds: getStorageNumber('timerSeconds', 10),
  vibration: getStorageBoolean('vibration', true),
};

export function settings(state: SettingsType = initialSettings, action: Redux.Action): SettingsType {
  switch(action.type) {
    case 'CHANGE_SETTINGS':
      const changes = (action as ChangeSettingsAction).settings;
      Object.keys(changes).forEach((key: string) => {
        setStorageKeyValue(key, changes[key]);
      });
      return {...state, ...changes};
    default:
      return state;
  }
}

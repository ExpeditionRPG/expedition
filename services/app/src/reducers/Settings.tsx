import Redux from 'redux';
import {ChangeSettingsAction} from '../actions/ActionTypes';
import {NODE_ENV} from '../Constants';
import {getStorageBoolean, getStorageJson, getStorageNumber, getStorageString, setStorageKeyValue} from '../LocalStorage';
import {ContentSetsType, DifficultyType, FontSizeType, SettingsType} from './StateTypes';

export const initialSettings: SettingsType = {
  audioEnabled: getStorageBoolean('audioEnabled', false),
  autoRoll: getStorageBoolean('autoRoll', false),
  contentSets: getStorageJson('contentSets', {horror: null}) as ContentSetsType,
  difficulty: getStorageString('difficulty', 'NORMAL') as DifficultyType,
  experimental: getStorageBoolean('experimental', false) || NODE_ENV === 'dev',
  fontSize: getStorageString('fontSize', 'NORMAL') as FontSizeType,
  multitouch: getStorageBoolean('multitouch', true),
  numLocalPlayers: getStorageNumber('numLocalPlayers', 1),
  showHelp: getStorageBoolean('showHelp', true),
  simulator: false, // this is only set by the Quest Creator
  timerSeconds: getStorageNumber('timerSeconds', 10),
  vibration: getStorageBoolean('vibration', true),
};

export function settings(state: SettingsType = initialSettings, action: Redux.Action): SettingsType {
  switch (action.type) {
    case 'CHANGE_SETTINGS':
      const changes = (action as ChangeSettingsAction).settings || {};
      Object.keys(changes).forEach((key: string) => {
        setStorageKeyValue(key, changes[key]);
      });
      return {...state, ...changes};
    default:
      return state;
  }
}

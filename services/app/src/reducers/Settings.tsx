import Redux from 'redux';
import { enumValues, Expansion, NODE_ENV } from 'shared/schema/Constants';
import { ChangeSettingsAction } from '../actions/ActionTypes';
import {
  getStorageBoolean,
  getStorageJson,
  getStorageNumber,
  getStorageString,
  setStorageKeyValue,
} from '../LocalStorage';
import { DifficultyType, FontSizeType, SettingsType } from './StateTypes';

export const initialSettings: SettingsType = {
  audioEnabled: getStorageBoolean('audioEnabled', false),
  autoRoll: getStorageBoolean('autoRoll', false),
  contentSets: getStorageJson('contentSets', {
    horror: null,
  }),
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

// The expansions this device owns, in enum order. This is the single source of
// truth for "which content is available", shared by getContentSets() (which
// additionally intersects with the other players in a multiplayer session) and
// by the search reducer, which keeps search params in step with it.
export function enabledExpansions(s: SettingsType): Expansion[] {
  const cs = (s && s.contentSets) || {};
  return enumValues(Expansion).filter(e => Boolean(cs[e]));
}

export function settings(
  state: SettingsType = initialSettings,
  action: Redux.Action,
): SettingsType {
  switch (action.type) {
    case 'CHANGE_SETTINGS': {
      const csa = action as ChangeSettingsAction;
      // Copy the payload: reducers must not mutate the action they were handed,
      // otherwise re-reducing the same action (multiplayer replay, RETURN) folds
      // one state's contentSets into another's.
      const changes = { ...(csa.settings || {}) };

      // Merge contentSets delta, if any
      if (changes.contentSets) {
        changes.contentSets = { ...state.contentSets, ...changes.contentSets };
      }

      // Update stored values
      Object.keys(changes).forEach((key: string) => {
        setStorageKeyValue(key, changes[key]);
      });
      return { ...state, ...changes };
    }
    default:
      return state;
  }
}

import {MultiplayerState, SettingsType} from '../reducers/StateTypes';
import {ChangeSettingsAction} from './ActionTypes';

export function changeSettings(settings: any): ChangeSettingsAction {
  // TODO: Changing player count in settings should affect
  // player status
  return {type: 'CHANGE_SETTINGS', settings};
}

export function numAdventurers(settings: SettingsType, rp: MultiplayerState): number {
  if (!rp || !rp.clientStatus || Object.keys(rp.clientStatus).length < 2) {
    // Since single player still has two adventurers, the minimum possible is two.
    return Math.max(2, settings.numLocalPlayers);
  }
  return countnumLocalPlayers(rp);
}

export function numLocalPlayers(settings: SettingsType, rp?: MultiplayerState): number {
  if (!rp || !rp.clientStatus || Object.keys(rp.clientStatus).length < 2) {
    return settings.numLocalPlayers;
  }
  return countnumLocalPlayers(rp);
}

function countnumLocalPlayers(rp: MultiplayerState): number {
  let count = 0;
  for (const c of Object.keys(rp.clientStatus)) {
    const status = rp.clientStatus[c];
    if (!status.connected) {
      continue;
    }
    count += (status.numLocalPlayers || 1);
  }
  return count || 1;
}

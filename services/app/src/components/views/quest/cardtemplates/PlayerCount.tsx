import {MultiplayerState, SettingsType} from '../../../../reducers/StateTypes';

function countNumPlayers(rp: MultiplayerState): number {
  let count = 0;
  for (const c of Object.keys(rp.clientStatus)) {
    const status = rp.clientStatus[c];
    if (!status.connected) {
      continue;
    }
    count += (status.numPlayers || 1);
  }
  return count || 1;
}

export function numAdventurers(settings: SettingsType, rp: MultiplayerState): number {
  if (!rp || !rp.clientStatus || Object.keys(rp.clientStatus).length < 2) {
    // Since single player still has two adventurers, the minimum possible is two.
    return Math.max(2, settings.numPlayers);
  }
  return countNumPlayers(rp);
}

export function numPlayers(settings: SettingsType, rp?: MultiplayerState): number {
  if (!rp || !rp.clientStatus || Object.keys(rp.clientStatus).length < 2) {
    return settings.numPlayers;
  }
  return countNumPlayers(rp);
}

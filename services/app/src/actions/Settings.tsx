import {MAX_ADVENTURERS} from 'app/Constants';
import * as seedrandom from 'seedrandom';
import {MultiplayerState, SettingsType} from '../reducers/StateTypes';
import {ChangeSettingsAction} from './ActionTypes';

export function changeSettings(settings: any): ChangeSettingsAction {
  // TODO: Changing player count in settings should affect
  // player status
  return {type: 'CHANGE_SETTINGS', settings};
}

export function numAdventurers(settings: SettingsType, rp: MultiplayerState): number {
  if (!rp || !rp.clientStatus || Object.keys(rp.clientStatus).length < 2) {
    return numLocalAdventurers(settings);
  }
  return countAllPlayers(rp);
}

export function numLocalAdventurers(settings: SettingsType) {
  // Since single player still has two adventurers, the minimum possible is two.
  return Math.max(2, settings.numLocalPlayers);
}

export function numPlayers(settings: SettingsType, rp?: MultiplayerState): number {
  if (!rp || !rp.clientStatus || Object.keys(rp.clientStatus).length < 2) {
    return settings.numLocalPlayers;
  }
  return countAllPlayers(rp);
}

export function playerOrder(seed: string): number[] {
  const rng = seedrandom.alea(seed);
  const order = [1, 2, 3, 4, 5, 6];
  for (let i = 0; i < MAX_ADVENTURERS; i++) {
    const swap = i + Math.floor(rng() * (MAX_ADVENTURERS - i));
    const tmp = order[i];
    order[i] = order[swap];
    order[swap] = tmp;
  }
  return order;
}

function countAllPlayers(rp: MultiplayerState): number {
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

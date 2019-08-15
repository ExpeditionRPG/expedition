import {MAX_ADVENTURERS} from 'app/Constants';
import Redux from 'redux';
import * as seedrandom from 'seedrandom';
import {Expansion} from 'shared/schema/Constants';
import {ParserNode} from '../components/views/quest/cardtemplates/TemplateTypes';
import {ContentSetsType, MultiplayerState, SettingsType} from '../reducers/StateTypes';
import {sendStatus} from './Multiplayer';

export function changeSettings(settings: any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch({type: 'CHANGE_SETTINGS', settings});
    dispatch(sendStatus());
  };
}

export function numAliveAdventurers(settings: SettingsType, node: ParserNode, mp: MultiplayerState): number {
  if (!mp || !mp.clientStatus || Object.keys(mp.clientStatus).length < 2) {
    if (node.elem.get(0).tagName === 'combat') {
      return node.ctx.templates.combat.numAliveAdventurers;
    }
    return numLocalAdventurers(settings);
  }

  let count = 0;
  for (const c of Object.keys(mp.clientStatus)) {
    const status = mp.clientStatus[c];
    if (!status.connected) {
      continue;
    }
    count += (status.aliveAdventurers || 0);
  }
  return count;
}

export function numAdventurers(settings: SettingsType, mp?: MultiplayerState): number {
  if (!mp || !mp.clientStatus || Object.keys(mp.clientStatus).length < 2) {
    return numLocalAdventurers(settings);
  }
  return countAllPlayers(mp);
}

export function numLocalAdventurers(settings: SettingsType, mp?: MultiplayerState) {
  if (!mp || !mp.clientStatus || Object.keys(mp.clientStatus).length < 2) {
    // Since single player still has two adventurers, the minimum possible is two.
    return Math.max(2, settings.numLocalPlayers);
  }
  // Multiplayer always has at least one other player, so there could be just one adventurer locally.
  return settings.numLocalPlayers;
}

export function numPlayers(settings: SettingsType, mp?: MultiplayerState): number {
  if (!mp || !mp.clientStatus || Object.keys(mp.clientStatus).length < 2) {
    return settings.numLocalPlayers;
  }
  return countAllPlayers(mp);
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

function countAllPlayers(mp: MultiplayerState): number {
  let count = 0;
  for (const c of Object.keys(mp.clientStatus)) {
    const status = mp.clientStatus[c];
    if (!status.connected) {
      continue;
    }
    count += (status.numLocalPlayers || 1);
  }
  return count || 1;
}

export function getContentSets(settings: SettingsType, mp?: MultiplayerState): Set<keyof ContentSetsType> {
  if (mp && mp.session) {
    return getContentSetIntersection(mp);
  }
  const cs = settings && settings.contentSets || {};
  return new Set(Object.keys(cs).filter((s: Expansion) => cs[s]) as Expansion[]);
}

// Get the content sets supported by all connected devices.
function getContentSetIntersection(multiplayer: MultiplayerState): Set<keyof ContentSetsType> {
  let result: Set<string>|null = null;
  const clients = multiplayer.clientStatus;
  Object.keys(clients).map((k) => {
    if (!clients[k].connected) {
      return;
    }

    const contentSets = new Set(clients[k].contentSets || []);
    if (!result) {
      result = contentSets;
      return;
    }
    // Set intersection
    result = new Set([...result].filter((c) => contentSets.has(c)));
  });
  return result || new Set();
}

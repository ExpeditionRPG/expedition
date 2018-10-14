import {initialMultiplayer} from 'app/reducers/Multiplayer';
import {initialSettings} from 'app/reducers/Settings';
import {MultiplayerState} from 'app/reducers/StateTypes';
import {numAdventurers, numPlayers, playerOrder} from './PlayerCount';

describe('PlayerCount', () => {
  const s = {...initialSettings, numPlayers: 1};
  const m4: MultiplayerState = {...initialMultiplayer, clientStatus: {
    a: {type: 'STATUS', connected: false},
    b: {type: 'STATUS', connected: true, numPlayers: 1},
    c: {type: 'STATUS', connected: true, numPlayers: 2},
    d: {type: 'STATUS', connected: true, numPlayers: 1},
  }};

  describe('numAdventurers', () => {
    test('returns 2 adventurers for singler-player mode', () => {
      expect(numAdventurers(s, initialMultiplayer)).toEqual(2);
    });
    test('sums up adventurers across all connected sessions', () => {
      expect(numAdventurers(s, m4)).toEqual(4);
    });
  });
  describe('numPlayers', () => {
    test('returns 1 for single-player mode', () => {
      expect(numPlayers(s, initialMultiplayer)).toEqual(1);
    });
    test('sums up players across all connected sessions', () => {
      expect(numPlayers(s, m4)).toEqual(4);
    });
  });
  describe('playerOrder', () => {
    test('returns order from 1-6', () => {
      expect(playerOrder('').sort()).toEqual([1,2,3,4,5,6]);
    });
    test('returns same order based on seed', () => {
      expect(playerOrder('')).toEqual(playerOrder(''));
    });
    test('returns different orders for different seeds', () => {
      expect(playerOrder('a')).not.toEqual(playerOrder('b'));
    })
  });
});

import {initialMultiplayer} from 'app/reducers/Multiplayer';
import {initialSettings} from 'app/reducers/Settings';
import {MultiplayerState} from 'app/reducers/StateTypes';
import {numAdventurers, numLocalPlayers} from './Settings';

describe('Settings action', () => {
  describe('changeSettings', () => {
    test('Empty', () => { /* Empty */ });
  });

  describe('PlayerCount', () => {
    const s = {...initialSettings, numLocalPlayers: 1};
    const m4: MultiplayerState = {...initialMultiplayer, clientStatus: {
      a: {type: 'STATUS', connected: false},
      b: {type: 'STATUS', connected: true, numLocalPlayers: 1},
      c: {type: 'STATUS', connected: true, numLocalPlayers: 2},
      d: {type: 'STATUS', connected: true, numLocalPlayers: 1},
    }};

    describe('numAdventurers', () => {
      test('returns 2 adventurers for singler-player mode', () => {
        expect(numAdventurers(s, initialMultiplayer)).toEqual(2);
      });
      test('sums up adventurers across all connected sessions', () => {
        expect(numAdventurers(s, m4)).toEqual(4);
      });
    });
    describe('numLocalPlayers', () => {
      test('returns 1 for single-player mode', () => {
        expect(numLocalPlayers(s, initialMultiplayer)).toEqual(1);
      });
      test('sums up players across all connected sessions', () => {
        expect(numLocalPlayers(s, m4)).toEqual(4);
      });
    });
  });
});

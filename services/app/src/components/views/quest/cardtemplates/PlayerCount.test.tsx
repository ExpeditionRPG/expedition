import {initialMultiplayer} from 'app/reducers/Multiplayer';
import {initialSettings} from 'app/reducers/Settings';
import {MultiplayerState} from 'app/reducers/StateTypes';
import {numAdventurers, numPlayers} from './PlayerCount';

describe('PlayerCount', () => {
  const s = {...initialSettings, numPlayers: 1};
  const m4: MultiplayerState = {...initialMultiplayer, clientStatus: {
    a: {type: 'STATUS', connected: false},
    b: {type: 'STATUS', connected: true, numPlayers: 1},
    c: {type: 'STATUS', connected: true, numPlayers: 2},
    d: {type: 'STATUS', connected: true, numPlayers: 1},
  }};

  describe('numAdventurers', () => {
    it('returns 2 adventurers for singler-player mode', () => {
      expect(numAdventurers(s, initialMultiplayer)).toEqual(2);
    });
    it('sums up adventurers across all connected sessions', () => {
      expect(numAdventurers(s, m4)).toEqual(4);
    });
  });
  describe('numPlayers', () => {
    it('returns 1 for single-player mode', () => {
      expect(numPlayers(s, initialMultiplayer)).toEqual(1);
    });
    it('sums up players across all connected sessions', () => {
      expect(numPlayers(s, m4)).toEqual(4);
    });
  });
});

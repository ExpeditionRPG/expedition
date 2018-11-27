import {initialMultiplayer} from 'app/reducers/Multiplayer';
import {initialSettings} from 'app/reducers/Settings';
import {MultiplayerState} from 'app/reducers/StateTypes';
import {numAdventurers, numPlayers, playerOrder, numAliveAdventurers} from './Settings';
import {defaultContext} from '../components/views/quest/cardtemplates/Template';
import {ParserNode} from '../components/views/quest/cardtemplates/TemplateTypes';


const cheerio = require('cheerio') as CheerioAPI;

describe('Settings action', () => {
  describe('changeSettings', () => {
    test('Empty', () => { /* Empty */ });
  });

  describe('PlayerCount', () => {
    const s = {...initialSettings, numLocalPlayers: 1};
    const n = new ParserNode(cheerio.load('<quest/>')('quest'), {...defaultContext(), templates: {combat: {numAliveAdventurers: 1}}});
    const n0 = new ParserNode(cheerio.load('<quest/>')('quest'), {...defaultContext(), templates: {combat: null}});
    const m4: MultiplayerState = {...initialMultiplayer, clientStatus: {
      a: {type: 'STATUS', connected: false, aliveAdventurers: 10},
      b: {type: 'STATUS', connected: true, numLocalPlayers: 1, aliveAdventurers: 1},
      c: {type: 'STATUS', connected: true, numLocalPlayers: 2, aliveAdventurers: 0},
      d: {type: 'STATUS', connected: true, numLocalPlayers: 1, aliveAdventurers: 1},
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
      test('sums up players across all connected devices', () => {
        expect(numPlayers(s, m4)).toEqual(4);
      });
    });
    describe('numAliveAdventurers', () => {
      test('returns node value from single player mode', () => {
        expect(numAliveAdventurers(s, n, initialMultiplayer)).toEqual(1);
      });
      test('sums up across all connected devices', () => {
        expect(numAliveAdventurers(s, n, m4)).toEqual(2);
      });
      test('returns total adventurer count when invalid node', () => {
        expect(numAliveAdventurers(s, n0, initialMultiplayer)).toEqual(2);
      })
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
});

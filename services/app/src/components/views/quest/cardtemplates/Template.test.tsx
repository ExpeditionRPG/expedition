import {defaultContext} from './Template';
import {initialSettings} from 'app/reducers/Settings';
import {initialMultiplayer} from 'app/reducers/Multiplayer';
import {evaluateOp} from 'shared/parse/Context';

describe('CardTemplates template', () => {
  describe('updateContext', () => {
    test.skip('persists readonly template nodes', () => { /* TODO */ });
  });

  describe('defaultContext', () => {
    test('scope._.contentSets gets content sets', () => {
      const ctx = defaultContext(() => return {
        settings: {...initialSettings, contentSets: {horror: true, future: false}},
        multiplayer: initialMultiplayer,
      });
      expect(ctx.scope._.contentSets()).toEqual({horror: true});
    });
    test('numAdventurers gets adventurer count', () => {
      const ctx = defaultContext(() => return {
        settings: {...initialSettings, numLocalPlayers: 3},
        multiplayer: initialMultiplayer,
      });
      expect(ctx.scope._.numAdventurers()).toEqual(3);
    });
    test('viewCount gets the view count for a node id', () => {
      const ctx = defaultContext(() => return {});
      ctx.views['a'] = 5;
      expect(evaluateOp('_.viewCount("a")', ctx)).toEqual(5);
    });
    test ('viewCount handles unviewed nodes', () => {
      const ctx = defaultContext(() => return {});
      expect(evaluateOp('_.viewCount("a")', ctx)).toEqual(0);
    });
  });
});

import {defaultContext} from './Template';
import {initialSettings} from 'app/reducers/Settings';
import {initialMultiplayer} from 'app/reducers/Multiplayer';

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
    test.skip('numAdventurers gets adventurer count', () => { /* TODO */ });
    test.skip('viewCount gets the view count for a node id', () => { /* TODO */ });
  });
});

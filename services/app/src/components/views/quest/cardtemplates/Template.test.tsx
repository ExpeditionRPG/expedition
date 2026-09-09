import * as cheerio from 'shared/Cheerio';
import { ParserNode } from './TemplateTypes';
import { initialMultiplayer } from 'app/reducers/Multiplayer';
import { initialSettings } from 'app/reducers/Settings';
import { evaluateOp } from 'shared/parse/Context';
import { defaultContext } from './Template';

describe('CardTemplates template', () => {
  describe('updateContext', () => {
    test('persists template state when cloning without mutating its source', () => {
      const node = new ParserNode(
        cheerio.load('<roleplay>Ready</roleplay>')('roleplay'),
        defaultContext(),
      );
      node.ctx.templates.combat.roundCount = 4;
      const cloned = node.clone();
      expect(cloned.ctx.templates).toEqual(node.ctx.templates);
      cloned.ctx.templates.combat.roundCount = 5;
      expect(node.ctx.templates.combat.roundCount).toBe(4);
      expect(cloned.ctx.seed).toBe(node.ctx.seed);
    });
  });

  describe('defaultContext', () => {
    test('scope._.contentSets gets content sets', () => {
      const ctx = defaultContext((() => ({
        settings: {
          ...initialSettings,
          contentSets: { horror: true, future: false },
        },
        multiplayer: initialMultiplayer,
      })) as any);
      expect(ctx.scope._.contentSets()).toEqual({ horror: true });
    });
    test('numAdventurers gets adventurer count', () => {
      const ctx = defaultContext((() => ({
        settings: { ...initialSettings, numLocalPlayers: 3 },
        multiplayer: initialMultiplayer,
      })) as any);
      expect(ctx.scope._.numAdventurers()).toEqual(3);
    });
    test('viewCount gets the view count for a node id', () => {
      const ctx = defaultContext((() => ({})) as any);
      ctx.views.a = 5;
      expect(evaluateOp('_.viewCount("a")', ctx)).toEqual(5);
    });
    test('viewCount handles unviewed nodes', () => {
      const ctx = defaultContext((() => ({})) as any);
      expect(evaluateOp('_.viewCount("a")', ctx)).toEqual(0);
    });
  });
});

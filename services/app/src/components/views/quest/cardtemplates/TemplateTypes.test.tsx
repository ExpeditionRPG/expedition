import * as cheerio from 'shared/Cheerio';
import { CombatPhase } from 'app/Constants';
import { defaultContext } from './Template';
import { ParserNode } from './TemplateTypes';

test.each([
  ['combat', CombatPhase.drawEnemies, true],
  ['roleplay', CombatPhase.drawEnemies, false],
  ['roleplay', CombatPhase.midCombatRoleplay, true],
  ['decision', CombatPhase.midCombatDecision, true],
])('detects combat for %s in phase %s', (tag, phase, expected) => {
  const ctx = defaultContext();
  ctx.templates.combat = { ...ctx.templates.combat, phase: phase };
  const node = new ParserNode(
    cheerio.load('<' + tag + '></' + tag + '>')(tag),
    ctx,
  );
  expect(node.inCombat()).toBe(expected);
});

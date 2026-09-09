import { ENCOUNTERS } from './Encounters';
import * as cheerio from 'shared/Cheerio';
import { defaultContext } from './components/views/quest/cardtemplates/Template';
import { ParserNode } from './components/views/quest/cardtemplates/TemplateTypes';
import { getEnemiesAndTier } from './components/views/quest/cardtemplates/combat/Actions';

test('generated encounters have normalized keys and usable combat tiers', () => {
  expect(Object.keys(ENCOUNTERS).length).toBeGreaterThan(0);
  for (const key of Object.keys(ENCOUNTERS)) {
    expect(key).toBe(ENCOUNTERS[key].name.toLowerCase());
    expect(Number.isInteger(ENCOUNTERS[key].tier)).toBe(true);
    expect(ENCOUNTERS[key].tier).toBeGreaterThan(0);
  }
});
test('encounter lookup populates combat enemies and sums their tiers', () => {
  const node = new ParserNode(
    cheerio.load('<combat><e>Giant Rat</e><e>Lich</e></combat>')('combat'),
    defaultContext(),
  );
  const result = getEnemiesAndTier(node);
  expect(result.enemies.map(enemy => enemy.name)).toEqual([
    'Giant Rat',
    'Lich',
  ]);
  expect(result.tier).toBe(ENCOUNTERS['giant rat'].tier + ENCOUNTERS.lich.tier);
});

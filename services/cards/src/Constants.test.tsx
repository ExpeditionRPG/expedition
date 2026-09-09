import {
  MAX_ADVENTURER_HEALTH,
  MAX_COUNTER_HEALTH,
  POKER_CARDS_PER_LETTER_PAGE,
  SHEETS,
} from './Constants';

test('print layout and health counters fit standard cards', () => {
  expect(POKER_CARDS_PER_LETTER_PAGE).toBe(9);
  expect(MAX_ADVENTURER_HEALTH).toBeGreaterThan(0);
  expect(MAX_ADVENTURER_HEALTH).toBeLessThanOrEqual(MAX_COUNTER_HEALTH);
});
test('published sources have unique names and usable sheet IDs including zero', () => {
  expect(new Set(SHEETS.map(source => source.name)).size).toBe(SHEETS.length);
  for (const source of SHEETS) {
    expect(source.key).toMatch(/^2PACX-/);
    expect(Object.keys(source.sheets).length).toBeGreaterThan(0);
    for (const id of Object.values(source.sheets)) expect(id).toMatch(/^\d+$/);
  }
  expect(SHEETS[0].sheets.Ability).toBe('0');
});

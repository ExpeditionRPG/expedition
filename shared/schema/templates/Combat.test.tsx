import { Logger } from '../../render/Logger';
import { isNumeric, sanitizeCombat } from './Combat';
describe('combat schema', () => {
  test.each([
    ['2', true],
    ['1.5', true],
    ['two', false],
    ['', false],
    [Infinity, false],
  ])('recognizes numeric input %p', (value, numeric) => {
    expect(isNumeric(value)).toBe(numeric);
  });
  test('reports malformed enemies and freestanding text, retaining valid outcomes', () => {
    const log = new Logger();
    const err = jest.spyOn(log, 'err');
    const win = { text: 'on win', outcome: ['victory'] };
    const lose = { text: 'on lose', outcome: ['defeat'] };
    const result = sanitizeCombat(
      { enemies: [{ text: 'Skeleton', json: { tier: -1 } }] },
      ['', 'orphan text', win, lose],
      10,
      () => 'end',
      log,
    );
    expect(result.body).toEqual([win, lose]);
    expect(err.mock.calls.map(c => c[1])).toEqual(['418', '416']);
  });
  test('creates recoverable fallbacks for missing enemies and outcomes', () => {
    const log = new Logger();
    const result = sanitizeCombat({}, [], 0, () => 'end', log);
    expect(result.attribs.enemies).toEqual([{ text: 'UNKNOWN' }]);
    expect(result.body).toEqual([
      { text: 'on win', outcome: ['end'] },
      { text: 'on lose', outcome: ['end'] },
    ]);
  });
});

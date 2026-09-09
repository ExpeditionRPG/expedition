import { Logger } from '../../render/Logger';
import { sanitizeTemplate } from './Sanitize';
describe('sanitizeTemplate', () => {
  test('preserves roleplay content and extensible attributes', () => {
    const body = ['A story', { text: 'Continue', outcome: ['end'] }];
    const attribs = { title: 'Opening', icon: 'adventurer' };
    const log = new Logger();
    expect(
      sanitizeTemplate('roleplay', attribs, body, 1, () => 'end', log),
    ).toEqual({ body, attribs });
    expect(log.finalize()).toEqual([]);
  });
  test('dispatches combat validation and supplies missing outcomes', () => {
    const log = new Logger();
    const err = jest.spyOn(log, 'err');
    const result = sanitizeTemplate(
      'combat',
      { enemies: [{ text: 'Skeleton' }] },
      [],
      7,
      () => 'end',
      log,
    );
    expect(result.body).toEqual([
      { text: 'on win', outcome: ['end'] },
      { text: 'on lose', outcome: ['end'] },
    ]);
    expect(err).toHaveBeenCalledWith(
      'combat card must have "on win" event',
      '417',
      7,
    );
  });
  test('rejects unknown template kinds', () => {
    expect(() =>
      sanitizeTemplate('unknown' as any, {}, [], 0, () => 'end', new Logger()),
    ).toThrow('unimplemented');
  });
});

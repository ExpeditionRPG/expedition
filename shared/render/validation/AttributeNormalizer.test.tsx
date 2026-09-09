import AttributeNormalizer from './AttributeNormalizer';
import { Logger } from '../Logger';
describe('AttributeNormalizer', () => {
  test('normalizes strings, case-insensitive booleans, integers and missing values', () => {
    const n = new AttributeNormalizer({
      title: 'Quest',
      enabled: 'TRUE',
      disabled: 'False',
      count: '12',
      invalid: 'maybe',
    });
    expect(n.getString('title')).toBe('Quest');
    expect(n.getBoolean('enabled')).toBe(true);
    expect(n.getBoolean('disabled')).toBe(false);
    expect(n.getNumber('count')).toBe(12);
    expect(n.getBoolean('invalid')).toBe(false);
    expect(n.getString('absent')).toBeUndefined();
  });
  test('reports missing required values, malformed numbers and unknown keys', () => {
    const log = new Logger();
    const err = jest.spyOn(log, 'err');
    const n = new AttributeNormalizer(
      { count: 'twelve', surprise: 'yes' },
      log,
    );
    expect(n.getString('title', true)).toBeUndefined();
    expect(n.getNumber('count')).toBe(0);
    n.confirmNoExtra();
    expect(err.mock.calls.map(c => c[1])).toEqual(['424', '426', '427']);
    expect(err.mock.calls[2][0]).toContain('surprise');
  });
});

import Normalize from './Normalize';
import { Logger } from '../Logger';
describe('Normalize.questAttrs', () => {
  test('maps quest metadata into typed attributes', () => {
    const log = new Logger();
    const err = jest.spyOn(log, 'err');
    expect(
      Normalize.questAttrs(
        {
          title: 'Quest',
          author: 'Alice',
          familyfriendly: 'true',
          minplayers: '1',
          maxplayers: '6',
          mintimeminutes: '10',
          maxtimeminutes: '30',
        },
        log,
      ),
    ).toMatchObject({
      title: 'Quest',
      author: 'Alice',
      familyFriendly: true,
      minplayers: 1,
      maxplayers: 6,
      mintimeminutes: 10,
      maxtimeminutes: 30,
    });
    expect(err).not.toHaveBeenCalled();
  });
  test('reports missing title and unsupported metadata', () => {
    const log = new Logger();
    const err = jest.spyOn(log, 'err');
    Normalize.questAttrs({ bogus: 'value' }, log);
    expect(err.mock.calls.map(c => c[1])).toEqual(['424', '427']);
  });
});

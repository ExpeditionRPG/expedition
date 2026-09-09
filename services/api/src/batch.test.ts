import { doFn } from './batch';
import * as request from 'request';
jest.mock('request', () => jest.fn());
test('runs a batch over published quests, skipping unpublished or removed entries', () => {
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  (request as any).mockImplementation((url: string, options: any, cb: any) =>
    cb(null, {}, '<quest>test</quest>'),
  );
  function quest(attrs: any): any {
    return { get: (key: string) => attrs[key] };
  }
  doFn(quest({ published: null }));
  doFn(quest({ published: new Date(), tombstone: new Date() }));
  expect(request).not.toHaveBeenCalled();
  doFn(
    quest({
      published: new Date(),
      tombstone: null,
      title: 'Quest',
      publishedurl: 'https://example.com/quest.xml',
    }),
  );
  expect(request).toHaveBeenCalledWith(
    'https://example.com/quest.xml',
    {},
    expect.any(Function),
  );
  expect(log).toHaveBeenCalledWith('<quest>test</quest>...');
});
test('reports a failed quest download without throwing on an absent body', () => {
  const error = jest.spyOn(console, 'error').mockImplementation(() => {});
  (request as any).mockImplementation((url: string, options: any, cb: any) =>
    cb(new Error('offline'), undefined, undefined),
  );
  expect(() =>
    doFn({
      get: (key: string) => (key === 'published' ? new Date() : null),
    } as any),
  ).not.toThrow();
  expect(error).toHaveBeenCalledWith(expect.stringContaining('invalid XML'));
});

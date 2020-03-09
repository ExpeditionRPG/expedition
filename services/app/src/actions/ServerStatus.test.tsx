import {Action} from '../Testing';
import {fetchServerStatus} from './ServerStatus';

const fetchMock = require('fetch-mock');

describe('ServerStatus set action', () => {
  // Entirely glue code; no testing needed right now.
});

describe('Fetch ServerStatus', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  test('Shows an announcement if present, overriding version update prompt', (done) => {
    fetchMock.get('*', {
      link: '',
      message: 'test',
      versions: {android: '999.999.999', ios: '999.999.999', web: '999.999.999'},
    });
    Action(fetchServerStatus as any, {}).execute().then((actions: any) => {
      expect(actions.length).toEqual(1);
      expect(actions[0]).toEqual(jasmine.objectContaining({
        type: 'SERVER_STATUS_SET',
        delta: jasmine.objectContaining({
          announcement: jasmine.objectContaining({
            message: 'test',
          }),
        }),
      }));
      done();
    }).catch(done.fail);
  });

  test('Shows update version prompt with platform-specific link if outdated version', (done) => {
    fetchMock.get('*', {
      link: '',
      message: '',
      versions: {android: '999.999.999', ios: '999.999.999', web: '999.999.999'},
    });
    Action(fetchServerStatus as any, {}).execute().then((actions: any) => {
      expect(actions.length).toEqual(1);
      expect(actions[0]).toEqual(jasmine.objectContaining({
        type: 'SERVER_STATUS_SET',
        delta: jasmine.objectContaining({
          announcement: jasmine.objectContaining({
            message: 'New version available, click here to upgrade',
          }),
        }),
      }));
      done();
    }).catch(done.fail);
  });

  test('Updates version status if latest version and no announcement', (done) => {
    fetchMock.get('*', {
      link: '',
      message: '',
      versions: {android: '0.0.0', ios: '0.0.0', web: '0.0.0'},
    });
    Action(fetchServerStatus as any, {}).execute().then((actions: any) => {
      expect(actions.length).toEqual(1);
      expect(actions[0]).toEqual(jasmine.objectContaining({
        type: 'SERVER_STATUS_SET',
        delta: jasmine.objectContaining({
          isLatestAppVersion: true,
        }),
      }));
      done();
    }).catch(done.fail);
  });

  test('Shows try again prompt and logs the error as well', (done) => {
    fetchMock.get('*', 400);
    const log = jasmine.createSpy('log');
    Action(fetchServerStatus as any, {}).execute(log).then((actions: any) => {
      expect(actions.length).toEqual(1);
      expect(actions[0]).toEqual(jasmine.objectContaining({
        type: 'SERVER_STATUS_SET',
        delta: jasmine.objectContaining({
          announcement: jasmine.objectContaining({
            message: 'Please try again in a few minutes. If the issue persists, you can contact support at contact@fabricate.io',
          }),
        }),
      }));
      expect(log).toHaveBeenCalled();
      done();
    }).catch(done.fail);
  });
});

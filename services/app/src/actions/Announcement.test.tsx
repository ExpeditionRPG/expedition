import {newMockStore} from '../Testing';
import {handleAnnouncements} from './Announcement';

describe('Announcement set action', () => {
  // Entirely glue code; no testing needed right now.
});

describe('Fetch Announcements', () => {
  test('Fetches and sets announcements', () => {
    // TODO - how to delay check until fetch complete? Callbacks?
    // That's an anti-pattern in this codebase
    // spyOn(window, 'fetch');
    // fetchAnnouncements();
    // expect(window.fetch).toHaveBeenCalledTimes(1);
  });
  test.skip('Silently logs error events', () => { /* TODO */ });
});

describe('Handle Announcements', () => {
  let store = null as any;
  beforeEach(() => {
    store = newMockStore({});
  });

  test('Shows an announcement if there is one', () => {
    store.dispatch(handleAnnouncements({
      link: '',
      message: 'test',
      versions: {android: '1', ios: '1', web: '1'},
    }));
    expect(store.getActions().length).toEqual(1);
    expect(store.getActions()[0]).toEqual(jasmine.objectContaining({type: 'ANNOUNCEMENT_SET', message: 'test'}));
  });
  test('Shows update version prompt with platform-specific link if outdated version', () => {
    store.dispatch(handleAnnouncements({
      link: '',
      message: '',
      versions: {android: '999.999.999', ios: '999.999.999', web: '999.999.999'},
    }));
    expect(store.getActions().length).toEqual(1);
    expect(store.getActions()[0]).toEqual(jasmine.objectContaining({type: 'ANNOUNCEMENT_SET', message: 'New version available, click here to upgrade'}));
  });
  test.skip('Does nothing if latest version and no announcement', () => { /* TODO */ });
});

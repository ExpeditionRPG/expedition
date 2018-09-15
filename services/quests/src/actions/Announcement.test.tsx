import {newMockStore} from '../Testing';
import {handleAnnouncements} from './Announcement';

const TEST_ANNOUNCEMENTS = {
  empty: {
    message: '',
    link: '',
  },
  message: {
    message: 'Text!',
    link: '',
  },
};

describe('Announcement action', () => {
  let store = null as any;
  beforeEach(() => {
    store = newMockStore({});
  });

  test('does not set announcement if empty', () => {
    store.dispatch(handleAnnouncements(TEST_ANNOUNCEMENTS.empty));
    expect(store.getActions().length).toEqual(0);
  });
  test('sets announcement if it has a message', () => {
    store.dispatch(handleAnnouncements(TEST_ANNOUNCEMENTS.message));
    expect(store.getActions().length).toEqual(1);
    expect(store.getActions()[0]).toEqual(jasmine.objectContaining({type: 'ANNOUNCEMENT_SET', message: TEST_ANNOUNCEMENTS.message.message}));
  });
});

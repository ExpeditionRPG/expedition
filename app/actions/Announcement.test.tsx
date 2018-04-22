import {fetchAnnouncements, handleAnnouncements} from './Announcement'

describe('Announcement set action', () => {
  // Entirely glue code; no testing needed right now.
});

describe('Fetch Announcements', () => {
  it('Fetches and sets announcements', () => {
    // TODO - how to delay check until fetch complete? Callbacks?
    // That's an anti-pattern in this codebase
    // spyOn(window, 'fetch');
    // fetchAnnouncements();
    // expect(window.fetch).toHaveBeenCalledTimes(1);
  });
  it('Silently logs error events');
});

describe('Handle Announcements', () => {
  it('Shows an announcement if there is one');
  it('Shows update version prompt with platform-specific link if outdated version');
  it('Does nothing if latest version and no announcement');
})

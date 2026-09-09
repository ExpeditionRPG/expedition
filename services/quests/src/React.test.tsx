jest.mock('react-ga', () => ({
  initialize: jest.fn(),
  event: jest.fn(),
  pageview: jest.fn(),
}));
jest.mock('react-dom', () => ({
  unmountComponentAtNode: jest.fn(),
  render: jest.fn(),
}));
jest.mock('./components/MainContainer', () => ({ default: () => null }));
jest.mock('./actions/Announcement', () => ({
  fetchAnnouncements: () => ({ type: 'TEST_ANNOUNCEMENTS' }),
}));
jest.mock('./actions/Quest', () => ({
  saveQuest: jest.fn(() => ({ type: 'TEST_SAVE' })),
}));
jest.mock('shared/auth/Web', () => ({
  checkForLogin: jest.fn(() => Promise.resolve(null)),
  getAuthorizationToken: jest.fn(),
}));
jest.mock('./actions/Editor', () => ({
  renderAndPlay: jest.fn(() => ({ type: 'TEST_PLAY' })),
}));
jest.mock('./Store', () => ({
  store: { dispatch: jest.fn(), getState: jest.fn() },
}));
import { store } from './Store';
import { saveQuest } from './actions/Quest';
import { renderAndPlay } from './actions/Editor';
import * as ReactDOM from 'react-dom';
import { checkForLogin, getAuthorizationToken } from 'shared/auth/Web';
import { AUTH_SETTINGS } from 'shared/schema/Constants';
test('restores the session without Google scripts and wires save/play shortcuts and unsaved-change protection', async () => {
  jest.useFakeTimers();
  const add = jest.spyOn(window, 'addEventListener');
  const previousError = window.onerror;
  const previousUnload = window.onbeforeunload;
  const previousGapi = window.gapi;
  window.gapi = undefined;
  const previousDollar = Object.getOwnPropertyDescriptor(globalThis, '$');
  Object.defineProperty(globalThis, '$', {
    configurable: true,
    value: { ajaxSetup: jest.fn() },
  });
  const base = document.createElement('div');
  base.id = 'react-app';
  document.body.appendChild(base);
  window.history.replaceState({}, '', '/');
  const state = {
    editor: { dirty: true, line: { number: 3 }, worker: null },
    quest: { mdRealtime: { getText: () => 'source' } },
  };
  (store.getState as jest.Mock).mockReturnValue(state);
  try {
    require('./React');
    expect(checkForLogin).toHaveBeenCalledWith(AUTH_SETTINGS.URL_BASE);
    await Promise.resolve();
    expect(getAuthorizationToken).not.toHaveBeenCalled();
    expect(store.dispatch).not.toHaveBeenCalledWith({ type: 'QUEST_LOADING' });
    expect(ReactDOM.render).toHaveBeenCalledWith(expect.anything(), base);
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'TEST_ANNOUNCEMENTS' });
    expect((window.onbeforeunload as any)()).toBe(false);
    state.editor.dirty = false;
    expect((window.onbeforeunload as any)()).toBeNull();
    state.editor.dirty = true;
    const handler = add.mock.calls.find(c => c[0] === 'keydown')![1] as any;
    const preventDefault = jest.fn();
    handler({ ctrlKey: true, which: 83, preventDefault });
    expect(preventDefault).toHaveBeenCalled();
    expect(saveQuest).toHaveBeenCalledWith(state.quest);
    handler({ metaKey: true, which: 13 });
    expect(renderAndPlay).toHaveBeenCalledWith(state.quest, 'source', 3, null);
  } finally {
    for (const [event, handler] of add.mock.calls)
      window.removeEventListener(event, handler);
    window.onerror = previousError;
    window.onbeforeunload = previousUnload;
    window.gapi = previousGapi;
    base.remove();
    jest.clearAllTimers();
    jest.useRealTimers();
    if (previousDollar) Object.defineProperty(globalThis, '$', previousDollar);
    else Reflect.deleteProperty(globalThis, '$');
  }
});

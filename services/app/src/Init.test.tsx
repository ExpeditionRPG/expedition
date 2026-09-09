import * as ReactDOM from 'react-dom';
import { checkForLogin } from 'shared/auth/Web';
import { setDeviceForTest, setDocument, setWindow, getGA } from './Globals';
import { init, setupHotReload } from './Init';
import { setupLogging } from './Logging';
import { initialSettings } from './reducers/Settings';
import { getStore, createAppStore } from './Store';
import { newMockStoreWithInitializedState } from './Testing';

jest.mock('./Logging', () => ({
  ...jest.requireActual('./Logging'),
  setupLogging: jest.fn(),
}));
jest.mock('./Store', () => ({
  getStore: jest.fn(),
  createAppStore: jest.fn(),
}));
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  render: jest.fn(),
  unmountComponentAtNode: jest.fn(),
}));
jest.mock('shared/auth/Web', () => ({
  ...jest.requireActual('shared/auth/Web'),
  checkForLogin: jest.fn(),
}));
jest.mock('./actions/ServerStatus', () => ({
  fetchServerStatus: () => ({ type: 'TEST_SERVER_STATUS' }),
  setServerStatus: delta => ({ type: 'SERVER_STATUS', delta }),
}));
jest.mock('./actions/Web', () => ({
  ...jest.requireActual('./actions/Web'),
  fetchUserQuests: () => ({ type: 'TEST_USER_QUESTS' }),
}));

let doc: Document;
let store: ReturnType<typeof newMockStoreWithInitializedState>;
let w: any;
beforeEach(() => {
  jest.useFakeTimers();
  doc = document.implementation.createHTMLDocument('test');
  doc.body.innerHTML = '<div id="react-app"></div>';
  store = newMockStoreWithInitializedState();
  (getStore as jest.Mock).mockReturnValue(store);
  (checkForLogin as jest.Mock).mockResolvedValue(null);
  w = {
    Promise,
    navigator: window.navigator,
    localStorage: window.localStorage,
    addEventListener: jest.fn(),
    plugins: { insomnia: { keepAwake: jest.fn() } },
    AndroidFullScreen: { immersiveMode: jest.fn() },
  };
  setWindow(w);
  setDocument(doc);
});
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  setWindow(window);
  setDocument(document);
  setDeviceForTest(undefined);
  delete (window as any).cordova;
  document.body.className = '';
});
test('sets up logging and analytics before rendering with no hot reload runtime', () => {
  init();
  expect(setupLogging).toHaveBeenCalledWith(console);
  expect(createAppStore).toHaveBeenCalled();
  expect(ReactDOM.render).toHaveBeenCalledWith(
    expect.anything(),
    doc.getElementById('react-app'),
  );
  expect(getGA()).toEqual(
    expect.objectContaining({ event: expect.any(Function) }),
  );
  expect(() => setupHotReload(null)).not.toThrow();
});
// Google identity scripts are loaded by index.html; init restores their session.
test('restores login at startup and fetches user quest information', async () => {
  const user = { id: 'user', loggedIn: true };
  (checkForLogin as jest.Mock).mockResolvedValue(user);
  init();
  await Promise.resolve();
  expect(checkForLogin).toHaveBeenCalledWith(expect.any(String));
  expect(store.getActions()).toContainEqual({ type: 'USER_LOGIN', user });
  expect(store.getActions()).toContainEqual({ type: 'TEST_USER_QUESTS' });
});
test('sets up hot reload and rerenders changed compositor', () => {
  const hot = { accept: jest.fn() };
  setupHotReload(hot);
  expect(hot.accept).toHaveBeenCalledWith();
  const callback = hot.accept.mock.calls.find(
    call => call[0] === './components/Compositor',
  )[1];
  (ReactDOM.render as jest.Mock).mockClear();
  callback();
  jest.advanceTimersByTime(0);
  expect(ReactDOM.render).toHaveBeenCalledTimes(1);
});
test.each([
  [{ ...initialSettings, contentSets: { horror: true } }, false],
  [undefined, true],
  [
    { ...initialSettings, contentSets: { expedition: true, horror: null } },
    true,
  ],
  [
    { ...initialSettings, contentSets: { expedition: true, horror: false } },
    false,
  ],
])('prompts for undefined content selections (%s)', (settings, expected) => {
  const state = { ...store.getState(), settings };
  jest.spyOn(store, 'getState').mockReturnValue(state as any);
  init();
  expect(
    store
      .getActions()
      .some(
        action =>
          action.type === 'DIALOG_SET' &&
          action.dialogID === 'EXPANSION_SELECT',
      ),
  ).toBe(expected);
});
test('checks announcements and new versions', () => {
  init();
  expect(store.getActions()).toContainEqual({ type: 'TEST_SERVER_STATUS' });
});
describe('deviceready', () => {
  function ready() {
    w.cordova = {};
    setDeviceForTest({ platform: 'android' } as any);
    init();
    doc.dispatchEvent(new Event('deviceready'));
  }
  test('adds backbutton listener', () => {
    ready();
    store.clearActions();
    doc.dispatchEvent(new Event('backbutton'));
    expect(store.getActions()).toContainEqual(
      expect.objectContaining({ type: 'RETURN' }),
    );
  });
  test('keeps screen awake, applies device style, and hides Android system UI', () => {
    ready();
    expect(w.plugins.insomnia.keepAwake).toHaveBeenCalledTimes(1);
    expect(document.body.className).toContain('android');
    expect(w.AndroidFullScreen.immersiveMode).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
    );
  });
  test('patches Android input scrolling on keyboard resize', () => {
    jest.spyOn(navigator, 'appVersion', 'get').mockReturnValue('Android');
    const input = document.createElement('input');
    input.scrollIntoView = jest.fn();
    document.body.appendChild(input);
    input.focus();
    ready();
    w.addEventListener.mock.calls.find(call => call[0] === 'resize')[1]();
    expect(input.scrollIntoView).toHaveBeenCalledTimes(1);
    input.remove();
  });
  test.each([
    ['pause', true],
    ['resume', false],
  ])('updates audio on %s', (event, paused) => {
    ready();
    store.clearActions();
    doc.dispatchEvent(new Event(event));
    expect(store.getActions()).toContainEqual(
      expect.objectContaining({
        type: 'AUDIO_SET',
        delta: expect.objectContaining({ paused }),
      }),
    );
  });
});

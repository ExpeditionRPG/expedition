jest.mock('./actions/Filters', () => ({
  loadFiltersFromUrl: jest.fn(() => () => undefined),
}));
jest.mock('./actions/Cards', () => ({
  ...jest.requireActual('./actions/Cards'),
  downloadCards: jest.fn(() => () => Promise.resolve()),
}));
import * as ReactDOM from 'react-dom';
import { getStore } from './Store';
import * as Cards from './actions/Cards';
import * as Filters from './actions/Filters';

test('startup loads URL filters and cards, mounts the app, and toggles print mode', () => {
  jest.useFakeTimers();
  document.body.innerHTML = '<div id="app"></div>';
  const load = jest.mocked(Filters.loadFiltersFromUrl);
  const download = jest.mocked(Cards.downloadCards);
  const render = jest.spyOn(ReactDOM, 'render').mockImplementation(() => null);
  jest.spyOn(ReactDOM, 'unmountComponentAtNode').mockReturnValue(true);
  const listener = jest.spyOn(window, 'addEventListener');
  try {
    require('./React');
    expect(load).toHaveBeenCalledTimes(1);
    expect(download).toHaveBeenCalledWith(
      getStore().getState().filters.source.current,
    );
    expect(render).toHaveBeenCalledWith(
      expect.anything(),
      document.getElementById('app'),
    );
    window.dispatchEvent(
      new KeyboardEvent('keydown', { ctrlKey: true, keyCode: 80, which: 80 }),
    );
    expect(getStore().getState().layout.printing).toBe(true);
    jest.advanceTimersByTime(10000);
    expect(getStore().getState().layout.printing).toBe(false);
  } finally {
    for (const [type, callback] of listener.mock.calls)
      window.removeEventListener(type, callback);
    jest.useRealTimers();
    document.body.innerHTML = '';
  }
});

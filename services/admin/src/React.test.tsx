import * as ReactDOM from 'react-dom';
import { store } from './Store';
jest.mock('react-ga', () => ({ initialize: jest.fn() }));
test('mounts the admin app and reports uncaught errors through its snackbar', () => {
  const oldError = window.onerror,
    oldUnload = window.onbeforeunload;
  const oldDollar = Object.getOwnPropertyDescriptor(globalThis, '$');
  const ajaxSetup = jest.fn();
  Object.defineProperty(globalThis, '$', {
    value: { ajaxSetup },
    configurable: true,
  });
  document.body.innerHTML = '<div id="react-app"></div>';
  const render = jest.spyOn(ReactDOM, 'render').mockImplementation(() => null);
  try {
    require('./React');
    expect(ajaxSetup).toHaveBeenCalledWith({
      xhrFields: { withCredentials: true },
    });
    expect(render).toHaveBeenCalledWith(
      expect.anything(),
      document.getElementById('react-app'),
    );
    expect(window.onerror('Failure', 'script.js', 2)).toBe(true);
    expect(store.getState().snackbar.open).toBe(true);
    expect(store.getState().snackbar.message.props.children).toEqual([
      'Error! ',
      'Failure',
    ]);
  } finally {
    window.onerror = oldError;
    window.onbeforeunload = oldUnload;
    if (oldDollar) Object.defineProperty(globalThis, '$', oldDollar);
    else Reflect.deleteProperty(globalThis, '$');
    document.body.innerHTML = '';
  }
});

import { createAppStore, getStore, installStore } from './Store';

test('creates the application store and runs asynchronous actions through middleware', () => {
  createAppStore();
  const store = getStore();
  expect(store.getState().multiplayer.connected).toBe(false);
  store.dispatch(dispatch =>
    dispatch({ type: 'DIALOG_SET', dialogID: 'REPORT_ERROR', message: 'test' }),
  );
  expect(store.getState().dialog).toEqual({
    open: 'REPORT_ERROR',
    message: 'test',
  });
  expect(getStore()).toBe(store);
});
test('allows a supplied store to replace the active store', () => {
  const previous = getStore();
  const replacement = { dispatch: jest.fn(), getState: jest.fn() } as any;
  try {
    installStore(replacement);
    expect(getStore()).toBe(replacement);
  } finally {
    installStore(previous);
  }
});

import { getStore } from './Store';

test('reuses the store and processes thunks through real reducers', () => {
  const store = getStore();
  expect(getStore()).toBe(store);
  store.dispatch(
    (dispatch: (action: { type: string; printing: boolean }) => void) =>
      dispatch({ type: 'LAYOUT_PRINTING', printing: true }),
  );
  expect(getStore().getState().layout.printing).toBe(true);
  store.dispatch({ type: 'LAYOUT_PRINTING', printing: false });
  expect(store.getState().layout.printing).toBe(false);
});

import { store } from './Store';
import { getStore } from 'app/Store';
test('shares dispatch/subscriptions with embedded app while scoping app getState to preview', () => {
  const app = getStore();
  expect(app.dispatch).toBe(store.dispatch);
  expect(app.getState()).toBe(store.getState().preview);
  expect(app.getState()).not.toHaveProperty('editor');
  const listener = jest.fn();
  const unsubscribe = app.subscribe(listener);
  store.dispatch({ type: 'SET_DIRTY', isDirty: true } as any);
  expect(store.getState().editor.dirty).toBe(true);
  expect(listener).toHaveBeenCalledTimes(1);
  unsubscribe();
});
test('preview reboot preserves the previous store snapshot and editor data', () => {
  const before = store.getState();
  const preview = before.preview;
  const editor = before.editor;
  store.dispatch({ type: 'REBOOT_APP' });
  expect(before.preview).toBe(preview);
  expect(store.getState().editor).toBe(editor);
  expect(store.getState().preview).not.toBe(preview);
  expect(store.getState().tutorial.playFromCursor).toBe(false);
});

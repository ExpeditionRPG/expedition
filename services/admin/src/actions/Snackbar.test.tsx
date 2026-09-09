import * as React from 'react';
import { setSnackbar } from './Snackbar';
import { snackbar } from '../reducers/Snackbar';
test('opens and closes a snackbar preserving its content and actions', () => {
  const message = <span>Saved</span>;
  const actions = [<button key="undo">Undo</button>];
  const state = snackbar(undefined, setSnackbar(true, message, actions, true));
  expect(state).toEqual({ open: true, message, actions, persist: true });
  expect(snackbar(state, setSnackbar(false)).open).toBe(false);
});

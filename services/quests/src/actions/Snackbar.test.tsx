import { setSnackbar } from './Snackbar';
test('preserves snackbar text, action, label and persistence and supports close', () => {
  const action = jest.fn();
  expect(setSnackbar(true, 'Saved', action, 'Undo', true)).toEqual({
    type: 'SNACKBAR_SET',
    open: true,
    message: 'Saved',
    action,
    actionLabel: 'Undo',
    persist: true,
  });
  expect(setSnackbar(false)).toEqual({
    type: 'SNACKBAR_SET',
    open: false,
    message: undefined,
    action: undefined,
    actionLabel: undefined,
    persist: undefined,
  });
});

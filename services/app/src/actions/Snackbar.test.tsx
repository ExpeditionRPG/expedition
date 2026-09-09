import { closeSnackbar, openSnackbar } from './Snackbar';

test('shows ordinary messages and closes the snackbar', () => {
  expect(openSnackbar('Saved')).toEqual({
    type: 'SNACKBAR_OPEN',
    message: 'Saved',
  });
  expect(closeSnackbar()).toEqual({ type: 'SNACKBAR_CLOSE' });
});
test('provides an error report action and only exposes details when requested', () => {
  const error = new Error('Offline');
  expect(openSnackbar(error)).toEqual(
    expect.objectContaining({
      message: 'Error! Please send feedback.',
      actionLabel: 'Report',
      action: expect.any(Function),
    }),
  );
  expect(openSnackbar(error, true).message).toBe('Offline');
});

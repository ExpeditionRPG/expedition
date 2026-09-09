import { setDialog } from './Dialog';

test('sets a dialog and message, and clears both when closed', () => {
  expect(setDialog('REPORT_ERROR', 'network unavailable')).toEqual({
    type: 'DIALOG_SET',
    dialogID: 'REPORT_ERROR',
    message: 'network unavailable',
  });
  expect(setDialog(null)).toEqual({
    type: 'DIALOG_SET',
    dialogID: null,
    message: undefined,
  });
});

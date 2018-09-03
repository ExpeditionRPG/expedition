import {SetDialogAction} from './ActionTypes';
import {setDialog} from './Dialogs';

describe('Dialog action', () => {
  describe('setDialog', () => {
    test('creates action', () => {
      expect(setDialog('ERROR', true)).toEqual({
        annotations: undefined,
        dialog: 'ERROR',
        shown: true,
        type: 'SET_DIALOG',
      } as SetDialogAction);
    });
  });

  describe('pushHTTPError', () => {
    test.skip('sets status as name', () => { /* TODO */ });

    test.skip('logs to GA', () => { /* TODO */ });
  });

  describe('pushError', () => {
    test.skip('pushes error', () => { /* TODO */ });

    test.skip('logs to GA', () => { /* TODO */ });
  });
});

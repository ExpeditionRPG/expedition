import {SetDialogAction} from './ActionTypes';
import {setDialog} from './Dialogs';

describe('Dialog action', () => {
  describe('setDialog', () => {
    it('creates action', () => {
      expect(setDialog('ERROR', true)).toEqual({
        type: 'SET_DIALOG',
        dialog: 'ERROR',
        shown: true,
        annotations: undefined,
      } as SetDialogAction);
    });
  });

  describe('pushHTTPError', () => {
    it('sets status as name');

    it('logs to GA');
  });

  describe('pushError', () => {
    it('pushes error');

    it('logs to GA');
  });
});

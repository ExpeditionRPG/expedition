import {SetDialogAction} from './ActionTypes';
import {setDialog} from './Dialogs';

describe('Dialog action', () => {
  describe('setDialog', () => {
    it('creates action', () => {
      expect(setDialog('ERROR', true)).toEqual({
        annotations: undefined,
        dialog: 'ERROR',
        shown: true,
        type: 'SET_DIALOG',
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

import {SetDialogAction} from './ActionTypes'
import {setDialog} from './Dialogs'

describe('Dialog action', () => {
  describe('setDialog', () => {
    it('creates action', () => {
      expect(setDialog('ERROR', true)).toEqual({
        type: 'SET_DIALOG',
        dialog: 'ERROR',
        shown: true
      } as SetDialogAction);
    });
  });
});

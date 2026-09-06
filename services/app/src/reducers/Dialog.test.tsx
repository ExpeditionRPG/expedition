import { setDialog } from '../actions/Dialog';
import { Reducer } from '../Testing';
import { dialog, initialDialog } from './Dialog';
import { DialogState } from './StateTypes';

describe('Dialog reducer', () => {
  describe('initial state', () => {
    test('is returned when state is undefined', () => {
      expect(dialog(undefined, { type: '@@INIT' })).toEqual(initialDialog);
    });

    test('starts with no dialog open', () => {
      expect(dialog(undefined, { type: '@@INIT' })).toEqual({ open: null });
    });
  });

  describe('unknown actions', () => {
    test('returns the exact same state object', () => {
      const state: DialogState = { open: 'EXIT_QUEST' };
      expect(dialog(state, { type: 'NOT_A_DIALOG_ACTION' })).toBe(state);
    });

    test('leaves an open dialog alone on @@INIT', () => {
      const state: DialogState = { open: 'FEEDBACK', message: 'hi' };
      expect(dialog(state, { type: '@@INIT' })).toBe(state);
    });
  });

  describe('DIALOG_SET', () => {
    test('opens a dialog by ID', () => {
      expect(dialog(initialDialog, setDialog('EXIT_QUEST')).open).toEqual(
        'EXIT_QUEST',
      );
    });

    test('opens a dialog with a message', () => {
      expect(
        dialog(initialDialog, setDialog('REPORT_ERROR', 'Something broke')),
      ).toEqual({
        open: 'REPORT_ERROR',
        message: 'Something broke',
      });
    });

    test('closes the dialog when given a null ID', () => {
      const open = dialog(initialDialog, setDialog('SET_PLAYER_COUNT'));
      expect(dialog(open, setDialog(null)).open).toEqual(null);
    });

    test('clears a stale message when closing', () => {
      const open = dialog(
        initialDialog,
        setDialog('REPORT_ERROR', 'Something broke'),
      );
      expect(dialog(open, setDialog(null)).message).toBeUndefined();
    });

    test('replaces rather than stacks when a second dialog opens', () => {
      const first = dialog(
        initialDialog,
        setDialog('MULTIPLAYER_STATUS', 'connecting'),
      );
      const second = dialog(first, setDialog('MULTIPLAYER_PEERS'));
      expect(second.open).toEqual('MULTIPLAYER_PEERS');
      expect(second.message).toBeUndefined();
    });

    test('reopening the same dialog without a message clears the old message', () => {
      const withMessage = dialog(
        initialDialog,
        setDialog('FEEDBACK', 'old text'),
      );
      expect(
        dialog(withMessage, setDialog('FEEDBACK')).message,
      ).toBeUndefined();
    });

    test('overwrites an existing message with a new one', () => {
      const withMessage = dialog(
        initialDialog,
        setDialog('FEEDBACK', 'old text'),
      );
      expect(
        dialog(withMessage, setDialog('FEEDBACK', 'new text')).message,
      ).toEqual('new text');
    });

    test('does not mutate the previous state', () => {
      const state: DialogState = { open: null };
      const next = dialog(state, setDialog('EXPANSION_SELECT'));
      expect(state.open).toEqual(null);
      expect(next).not.toBe(state);
    });

    test('applies through a dispatched setDialog action', () => {
      Reducer(dialog)
        .withState({ open: null })
        .expect(setDialog('DELETE_SAVED_QUEST', 'Delete this save?'))
        .toReturnState({
          open: 'DELETE_SAVED_QUEST',
          message: 'Delete this save?',
        });
    });
  });
});

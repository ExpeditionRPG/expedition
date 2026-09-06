import { SnackbarSetAction } from '../actions/ActionTypes';
import { snackbar } from './Snackbar';
import { SnackbarState } from './StateTypes';

describe('snackbar', () => {
  test('returns initial state', () => {
    expect(snackbar(undefined, { type: '@@INIT' })).toEqual({
      message: '',
      open: false,
    });
  });

  test('passes through unknown actions without changing the state object', () => {
    const state: SnackbarState = { message: 'saved', open: true };
    expect(snackbar(state, { type: 'SOME_OTHER_ACTION' })).toBe(state);
  });

  describe('SNACKBAR_SET', () => {
    test('opens with a message', () => {
      const action = {
        message: 'Quest saved',
        open: true,
        type: 'SNACKBAR_SET',
      } as SnackbarSetAction;
      const result = snackbar({ message: '', open: false }, action);
      expect(result.open).toEqual(true);
      expect(result.message).toEqual('Quest saved');
    });

    test('carries the action, actionLabel and persist through', () => {
      const undo = jest.fn();
      const action: SnackbarSetAction = {
        action: undo,
        actionLabel: 'Undo',
        message: 'Quest deleted',
        open: true,
        persist: true,
        type: 'SNACKBAR_SET',
      };
      const result = snackbar({ message: '', open: false }, action);
      expect(result).toEqual({
        action: undo,
        actionLabel: 'Undo',
        message: 'Quest deleted',
        open: true,
        persist: true,
      });
      expect(undo).not.toHaveBeenCalled();
    });

    test('closing clears the previous message and action', () => {
      const state: SnackbarState = {
        action: jest.fn(),
        actionLabel: 'Undo',
        message: 'Quest deleted',
        open: true,
        persist: true,
      };
      const action = { open: false, type: 'SNACKBAR_SET' } as SnackbarSetAction;
      const result = snackbar(state, action);
      expect(result.open).toEqual(false);
      expect(result.message).toBeUndefined();
      expect(result.action).toBeUndefined();
      expect(result.actionLabel).toBeUndefined();
      expect(result.persist).toBeUndefined();
    });

    test('does not mutate the state it was handed', () => {
      const state: SnackbarState = { message: 'old', open: true };
      const action = {
        message: 'new',
        open: true,
        type: 'SNACKBAR_SET',
      } as SnackbarSetAction;
      const result = snackbar(state, action);
      expect(state).toEqual({ message: 'old', open: true });
      expect(result).not.toBe(state);
    });

    test('does not leak the action type into the state', () => {
      const action = {
        message: 'hi',
        open: true,
        type: 'SNACKBAR_SET',
      } as SnackbarSetAction;
      expect(
        Object.keys(snackbar({ message: '', open: false }, action)),
      ).not.toContain('type');
    });
  });
});

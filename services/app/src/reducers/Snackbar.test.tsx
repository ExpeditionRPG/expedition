import { Reducer } from '../Testing';
import { initialSnackbar, snackbar } from './Snackbar';
import { SnackbarState } from './StateTypes';

const OPEN_STATE: SnackbarState = {
  action: () => null,
  actionLabel: 'Retry',
  message: 'Something went wrong',
  open: true,
  timeout: 1,
};

describe('Snackbar reducer', () => {
  test('defaults to a closed, empty snackbar', () => {
    const state = snackbar(undefined, { type: '@@INIT' });
    expect(state).toEqual(initialSnackbar);
    expect(state.open).toEqual(false);
    expect(state.message).toEqual('');
    expect(state.timeout).toEqual(6000);
  });

  test('ignores unknown actions', () => {
    expect(snackbar(OPEN_STATE, { type: 'NOT_A_REAL_ACTION' })).toBe(
      OPEN_STATE,
    );
  });

  describe('SNACKBAR_OPEN', () => {
    test('opens with the given message and the default timeout', () => {
      Reducer(snackbar)
        .withState(initialSnackbar)
        .expect({ type: 'SNACKBAR_OPEN', message: 'Quest saved' } as any)
        .toReturnState({
          action: undefined,
          actionLabel: undefined,
          message: 'Quest saved',
          open: true,
          timeout: 6000,
        });
    });

    test('carries the action and its label', () => {
      const action = jest.fn();
      const result = snackbar(initialSnackbar, {
        type: 'SNACKBAR_OPEN',
        message: 'Failed to load',
        action,
        actionLabel: 'Retry',
      } as any);
      expect(result.action).toBe(action);
      expect(result.actionLabel).toEqual('Retry');
      expect(result.open).toEqual(true);
    });

    test('does not leak the previous snackbar action when the new one has none', () => {
      const result = snackbar(OPEN_STATE, {
        type: 'SNACKBAR_OPEN',
        message: 'Quest saved',
      } as any);
      expect(result.action).toBeUndefined();
      expect(result.actionLabel).toBeUndefined();
      expect(result.message).toEqual('Quest saved');
    });

    test('resets a shortened timeout back to the default', () => {
      const result = snackbar(OPEN_STATE, {
        type: 'SNACKBAR_OPEN',
        message: 'Quest saved',
      } as any);
      expect(result.timeout).toEqual(6000);
    });

    test('refuses to open on an empty message', () => {
      const result = snackbar(initialSnackbar, {
        type: 'SNACKBAR_OPEN',
        message: '',
      } as any);
      expect(result).toBe(initialSnackbar);
      expect(result.open).toEqual(false);
    });

    test('refuses to open on a missing message', () => {
      const result = snackbar(initialSnackbar, {
        type: 'SNACKBAR_OPEN',
      } as any);
      expect(result).toBe(initialSnackbar);
      expect(result.open).toEqual(false);
    });

    test('leaves an already-open snackbar alone on an empty message', () => {
      const result = snackbar(OPEN_STATE, {
        type: 'SNACKBAR_OPEN',
        message: '',
      } as any);
      expect(result).toBe(OPEN_STATE);
      expect(result.message).toEqual('Something went wrong');
    });
  });

  describe('SNACKBAR_CLOSE', () => {
    test('resets every field, including the action and label', () => {
      const result = snackbar(OPEN_STATE, { type: 'SNACKBAR_CLOSE' });
      expect(result).toEqual(initialSnackbar);
      expect(result.open).toEqual(false);
      expect(result.message).toEqual('');
      expect(result.action).toBeUndefined();
      expect(result.actionLabel).toBeUndefined();
      expect(result.timeout).toEqual(6000);
    });

    test('returns a fresh object rather than the shared initial state', () => {
      const result = snackbar(OPEN_STATE, { type: 'SNACKBAR_CLOSE' });
      expect(result).not.toBe(initialSnackbar);
    });
  });
});

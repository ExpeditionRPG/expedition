import { snackbar } from './Snackbar';

describe('snackbar reducer', () => {
  test('returns the initial closed state when given undefined', () => {
    expect(snackbar(undefined, { type: '@@INIT' })).toEqual({ open: false });
  });

  test('stores message, actions, open and persist on SNACKBAR_SET', () => {
    const actions = ['RETRY' as any];
    const result = snackbar({ open: false }, {
      actions,
      message: 'Quest saved' as any,
      open: true,
      persist: true,
      type: 'SNACKBAR_SET',
    } as any);
    expect(result).toEqual({
      actions,
      message: 'Quest saved',
      open: true,
      persist: true,
    });
  });

  test('clears the previous message when SNACKBAR_SET omits it', () => {
    const result = snackbar(
      { message: 'Old message' as any, open: true, persist: true },
      {
        open: false,
        type: 'SNACKBAR_SET',
      } as any,
    );
    expect(result.open).toEqual(false);
    expect(result.message).toBeUndefined();
    expect(result.actions).toBeUndefined();
    expect(result.persist).toBeUndefined();
  });

  test('does not mutate the state it was given', () => {
    const state = { message: 'Old message' as any, open: true };
    const result = snackbar(state, {
      message: 'New message' as any,
      open: true,
      type: 'SNACKBAR_SET',
    } as any);
    expect(state).toEqual({ message: 'Old message', open: true });
    expect(result).not.toBe(state);
  });

  test('returns the same state object for unhandled actions', () => {
    const state = { message: 'Still here' as any, open: true };
    expect(snackbar(state, { type: 'SNACKBAR_UNRELATED' })).toBe(state);
  });
});

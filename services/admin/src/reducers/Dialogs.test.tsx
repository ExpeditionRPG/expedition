import { dialogs } from './Dialogs';

describe('dialogs reducer', () => {
  test('returns the initial state when given undefined', () => {
    expect(dialogs(undefined, { type: '@@INIT' })).toEqual({ open: 'NONE' });
  });

  test('opens the named dialog on SET_DIALOG', () => {
    expect(
      dialogs({ open: 'NONE' }, {
        type: 'SET_DIALOG',
        dialog: 'QUEST_DETAILS',
      } as any),
    ).toEqual({ open: 'QUEST_DETAILS' });
  });

  test('closes the open dialog when SET_DIALOG carries NONE', () => {
    expect(
      dialogs({ open: 'USER_DETAILS' }, {
        type: 'SET_DIALOG',
        dialog: 'NONE',
      } as any),
    ).toEqual({ open: 'NONE' });
  });

  test('replaces one open dialog with another', () => {
    expect(
      dialogs({ open: 'FEEDBACK_DETAILS' }, {
        type: 'SET_DIALOG',
        dialog: 'USER_DETAILS',
      } as any),
    ).toEqual({ open: 'USER_DETAILS' });
  });

  test('does not mutate the state it was given', () => {
    const state = { open: 'NONE' } as any;
    const result = dialogs(state, {
      type: 'SET_DIALOG',
      dialog: 'QUEST_DETAILS',
    } as any);
    expect(state).toEqual({ open: 'NONE' });
    expect(result).not.toBe(state);
  });

  test('returns the same state object for unhandled actions', () => {
    const state = { open: 'FEEDBACK_DETAILS' } as any;
    expect(dialogs(state, { type: 'NOT_A_DIALOGS_ACTION' })).toBe(state);
  });
});

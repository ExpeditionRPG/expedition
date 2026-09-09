import { dialogs } from './Dialogs';
import errors from '../../errors/errors';
describe('dialogs reducer', () => {
  test('initializes closed and toggles each supported dialog independently', () => {
    const initial = dialogs(undefined, { type: 'INIT' });
    expect(initial.errors).toEqual([]);
    for (const dialog of Object.keys(initial.open)) {
      expect(initial.open[dialog]).toBe(false);
      expect(
        dialogs(initial, { type: 'SET_DIALOG', dialog, shown: true } as any)
          .open[dialog],
      ).toBe(true);
    }
    expect(
      dialogs(initial, { type: 'QUEST_PUBLISHING_SETUP' }).open.PUBLISHING,
    ).toBe(true);
  });
  // Save/new/load confirmations were replaced by autosave; they no longer open dialogs.
  test('unrelated quest/profile actions preserve open dialogs', () => {
    const state = dialogs(undefined, {
      type: 'SET_DIALOG',
      dialog: 'USER',
      shown: true,
    } as any);
    for (const type of [
      'NEW_QUEST',
      'RECEIVE_QUEST_LOAD',
      'RECEIVE_QUEST_PUBLISH',
      'SET_PROFILE_META',
    ])
      expect(dialogs(state, { type })).toBe(state);
  });
  test('opens errors and clears old errors when closed', () => {
    const error = new Error('failed');
    const initial = dialogs(undefined, { type: 'INIT' });
    const state = dialogs(initial, { type: 'PUSH_ERROR', error } as any);
    expect(state.open.ERROR).toBe(true);
    expect(state.errors).toEqual([error]);
    expect(
      dialogs(state, {
        type: 'SET_DIALOG',
        dialog: 'ERROR',
        shown: false,
      } as any).errors,
    ).toEqual([]);
    expect(initial.errors).toEqual([]);
  });
  test('resolves annotation details and preserves unknown numbers', () => {
    const id = Number(Object.keys(errors)[0]);
    const state = dialogs(undefined, {
      type: 'SET_DIALOG',
      dialog: 'ANNOTATION_DETAIL',
      shown: true,
      annotations: [id, 999999],
    } as any);
    expect(state.annotations).toEqual([errors[id], 999999]);
    expect(
      dialogs(state, {
        type: 'SET_DIALOG',
        dialog: 'ANNOTATION_DETAIL',
        shown: false,
      } as any).annotations,
    ).toEqual([]);
  });
});

import { defaultState, editor } from './Editor';
describe('editor reducer', () => {
  test('initializes and preserves unknown actions', () => {
    expect(editor(undefined, { type: '@@INIT' })).toEqual(defaultState);
    expect(editor(defaultState, { type: 'UNKNOWN' })).toBe(defaultState);
  });
  test('sets dirty and clears it after a successful save', () => {
    const state = editor(undefined, {
      type: 'SET_DIRTY',
      isDirty: true,
    } as any);
    expect(state.dirty).toBe(true);
    expect(editor(state, { type: 'RECEIVE_QUEST_SAVE' }).dirty).toBe(false);
    expect(state.dirty).toBe(true);
  });
  // New and delete are no longer editor actions: loading replaces the quest.
  test('tracks loading without discarding unsaved state prematurely', () => {
    const state = { ...defaultState, dirty: true };
    expect(editor(state, { type: 'QUEST_LOADING' })).toEqual({
      ...state,
      loadingQuest: true,
    });
    expect(
      editor({ ...state, loadingQuest: true }, { type: 'RECEIVE_QUEST_LOAD' })
        .loadingQuest,
    ).toBe(false);
  });
  test('returns to the open action when a linked quest needs Drive authorization', () => {
    expect(
      editor(
        { ...defaultState, loadingQuest: true },
        { type: 'QUEST_LOAD_DEFERRED' },
      ),
    ).toEqual(defaultState);
  });
});

import { quest } from './Quest';
describe('quest reducer', () => {
  test('initializes an empty quest', () =>
    expect(quest(undefined, { type: 'INIT' })).toEqual({}));
  test('merges metadata without mutating the previous quest', () => {
    const state = { title: 'Old', id: 'q' };
    expect(
      quest(state, {
        type: 'QUEST_METADATA_CHANGE',
        delta: { title: 'New' },
      } as any),
    ).toEqual({ title: 'New', id: 'q' });
    expect(state.title).toBe('Old');
  });
  test('replaces loaded quests and clears when loading or creating another', () => {
    const state = { id: 'old' };
    const loaded = { id: 'new', title: 'New' };
    expect(
      quest(state, { type: 'RECEIVE_QUEST_LOAD', quest: loaded } as any),
    ).toBe(loaded);
    for (const type of ['NEW_QUEST', 'QUEST_LOADING'])
      expect(quest(state, { type })).toEqual({});
  });
  test('merges publication responses and preserves local editing data', () => {
    expect(
      quest({ id: 'q', title: 'Local' }, {
        type: 'RECEIVE_QUEST_PUBLISH',
        quest: { published: 'today' },
      } as any),
    ).toEqual({ id: 'q', title: 'Local', published: 'today' });
    expect(
      quest({ published: 'today' }, {
        type: 'RECEIVE_QUEST_UNPUBLISH',
        quest: { published: undefined },
      } as any).published,
    ).toBeUndefined();
  });
});

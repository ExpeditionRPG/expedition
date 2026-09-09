import { mapStateToProps, mapDispatchToProps } from './ContextEditorContainer';
import { newMockStoreWithInitializedState } from '../Testing';
test('maps prior and current scopes and dispatches initial context edits', () => {
  const initial = newMockStoreWithInitializedState().getState();
  const prior = { gold: 1 },
    current = { gold: 2 };
  const state = {
    ...initial,
    editor: { ...initial.editor, opInit: 'gold = 5' },
    preview: {
      ...initial.preview,
      _history: [{}, { quest: { node: { ctx: { scope: prior } } } }],
      quest: { node: { ctx: { scope: current } } },
    },
  };
  expect(mapStateToProps(state as any)).toEqual({
    scopeHistory: [prior, current],
    opInit: 'gold = 5',
  });
  const dispatch = jest.fn();
  mapDispatchToProps(dispatch).onInitialContext('gold = 8');
  expect(dispatch).toHaveBeenCalledWith({
    type: 'SET_OP_INIT',
    mathjs: 'gold = 8',
  });
});

import { newMockStoreWithInitializedState } from 'app/Testing';
import { mapStateToProps } from './Types';
test('falls back to the current quest node when ownProps.node is unset', () => {
  const state = newMockStoreWithInitializedState().getState();
  const result = mapStateToProps(state, {});
  expect(result.node).toBe(state.quest.node);
  expect(result.settings).toBe(state.settings);
  expect(result.multiplayer).toBe(state.multiplayer);
  expect(result.seed).toBe(state.quest.node?.ctx.seed || '');
});

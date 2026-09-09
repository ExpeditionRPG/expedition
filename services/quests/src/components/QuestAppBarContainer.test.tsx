jest.mock('../actions/User', () => ({
  logoutUser: jest.fn(() => ({ type: 'LOG_OUT' })),
}));
import { mapStateToProps, mapDispatchToProps } from './QuestAppBarContainer';
import { loggedOutUser } from 'shared/auth/UserState';
import { newMockStoreWithInitializedState } from '../Testing';
test('combines annotations and current preview scope', () => {
  const state = newMockStoreWithInitializedState().getState();
  const scope = { gold: 3 };
  state.preview.quest = { node: { ctx: { scope } } } as any;
  state.annotations = {
    playtest: [{ row: 1 } as any],
    spellcheck: [{ row: 2 } as any],
  };
  expect(mapStateToProps(state)).toEqual({
    annotations: [
      ...state.annotations.spellcheck,
      ...state.annotations.playtest,
    ],
    editor: state.editor,
    quest: state.quest,
    user: state.user,
    scope,
  });
});
test('sign-out request dispatches logout (the user dialog was removed)', () => {
  const dispatch = jest.fn();
  mapDispatchToProps(dispatch).onUserDialogRequest(loggedOutUser);
  expect(dispatch).toHaveBeenCalledWith({ type: 'LOG_OUT' });
});

import { store } from './Store';
import { setDialog } from './actions/Dialogs';
import { setProfileMeta } from './actions/User';
import { loggedOutUser } from './reducers/User';
test('initializes real state and applies thunk-dispatched user and dialog changes', () => {
  expect(store.getState().user.loggedIn).toBe(false);
  store.dispatch(dispatch => {
    dispatch(
      setProfileMeta({
        ...loggedOutUser,
        loggedIn: true,
        email: 'admin@example.com',
      }),
    );
    dispatch(setDialog('USER_DETAILS'));
  });
  expect(store.getState().user.email).toBe('admin@example.com');
  expect(store.getState().dialogs.open).toBe('USER_DETAILS');
});

jest.mock('shared/auth/Web', () => ({
  loadGapi: jest.fn(),
  getAuthorizationToken: jest.fn(),
}));
jest.mock('./Quest', () => ({
  loadQuestFromURL: jest.fn(() => ({ type: 'LOAD_FROM_URL' })),
}));
import { ensureToken, postLoginUser } from './User';
import { loadGapi, getAuthorizationToken } from 'shared/auth/Web';
import { loadQuestFromURL } from './Quest';
import { loggedOutUser } from 'shared/auth/UserState';
// Popup polling was replaced by GIS authorization and a post-login callback.
test('reuses an existing Drive token without opening authorization', async () => {
  window.gapi = { client: { getToken: () => 'token' } };
  expect(await ensureToken()).toBe('token');
  expect(getAuthorizationToken).not.toHaveBeenCalled();
});
test('loads GAPI, requests authorization and stores the new token', async () => {
  window.gapi = {
    client: { getToken: () => null },
    auth: { setToken: jest.fn() },
  };
  (loadGapi as jest.Mock).mockResolvedValue(window.gapi);
  (getAuthorizationToken as jest.Mock).mockResolvedValue('new-token');
  expect(await ensureToken()).toBe('new-token');
  expect(loadGapi).toHaveBeenCalled();
  expect(getAuthorizationToken).toHaveBeenCalled();
  expect(window.gapi.auth.setToken).toHaveBeenCalledWith('new-token');
});
test('dispatches profile metadata and loads the requested quest after login', () => {
  const user = { ...loggedOutUser, email: 'test@example.com' };
  const dispatch = jest.fn();
  postLoginUser(user, 'quest-id')(dispatch);
  expect(dispatch).toHaveBeenCalledWith({ type: 'SET_PROFILE_META', user });
  expect(loadQuestFromURL).toHaveBeenCalledWith(user, 'quest-id');
  expect(dispatch).toHaveBeenLastCalledWith({ type: 'LOAD_FROM_URL' });
});

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
beforeEach(() => jest.clearAllMocks());
test('reuses an existing Drive token without opening authorization', async () => {
  window.gapi = { client: { getToken: () => 'token' } };
  expect(await ensureToken()).toBe('token');
  expect(getAuthorizationToken).not.toHaveBeenCalled();
});
test('requests authorization synchronously before GAPI initialization', async () => {
  window.gapi = { client: { getToken: () => null, setToken: jest.fn() } };
  (loadGapi as jest.Mock).mockResolvedValue(window.gapi);
  (getAuthorizationToken as jest.Mock).mockResolvedValue({
    access_token: 'new-token',
  });
  const result = ensureToken(true);
  expect(getAuthorizationToken).toHaveBeenCalled();
  expect(loadGapi).not.toHaveBeenCalled();
  expect(await result).toEqual({ access_token: 'new-token' });
  expect(window.gapi.client.setToken).toHaveBeenCalledWith({
    access_token: 'new-token',
  });
});
test('background token checks never open a popup', async () => {
  window.gapi = undefined;
  await expect(ensureToken()).rejects.toThrow('Connect Google Drive');
  expect(getAuthorizationToken).not.toHaveBeenCalled();
});
test('restoring a session tries a linked quest without requesting Drive consent', () => {
  window.gapi = { client: { getToken: () => null } };
  const user = { ...loggedOutUser, email: 'test@example.com' };
  const dispatch = jest.fn();
  postLoginUser(user, 'quest-id')(dispatch);
  expect(dispatch).toHaveBeenCalledTimes(2);
  expect(dispatch).toHaveBeenCalledWith({ type: 'SET_PROFILE_META', user });
  expect(loadQuestFromURL).toHaveBeenCalledWith(user, 'quest-id', true);
  expect(getAuthorizationToken).not.toHaveBeenCalled();
});
test('resumes a quest when Drive is already authorized', () => {
  window.gapi = { client: { getToken: () => 'token' } };
  const user = { ...loggedOutUser, email: 'test@example.com' };
  postLoginUser(user, 'quest-id')(jest.fn());
  expect(loadQuestFromURL).toHaveBeenCalledWith(user, 'quest-id', true);
});

jest.mock('../Globals', () => ({
  getGapi: jest.fn(),
  getGA: jest.fn(() => null),
}));
import { getGapi } from '../Globals';
import { login, silentLogin, setProfileMeta, handleFetchErrors } from './User';
import { loggedOutUser } from '../reducers/User';
import { authSettings } from '../Constants';
const fetchMock = require('fetch-mock');
afterEach(() => {
  fetchMock.restore();
  Reflect.deleteProperty(window, 'gapiLoaded');
});
test('silent login reports logged-out state without a network request', () => {
  Object.defineProperty(window, 'gapiLoaded', {
    value: true,
    configurable: true,
  });
  jest.mocked(getGapi).mockReturnValue({
    auth2: { getAuthInstance: () => ({ isSignedIn: { get: () => false } }) },
  });
  const dispatch = jest.fn(),
    callback = jest.fn();
  silentLogin(callback)(dispatch);
  expect(dispatch).toHaveBeenCalledWith({
    type: 'USER_LOGIN',
    user: loggedOutUser,
  });
  expect(callback).toHaveBeenCalledWith(loggedOutUser);
  expect(fetchMock.calls()).toHaveLength(0);
});
test('interactive login registers credentials and returns the server user identity', async () => {
  Object.defineProperty(window, 'gapiLoaded', {
    value: true,
    configurable: true,
  });
  const googleUser = {
    getAuthResponse: () => ({ id_token: 'test-jwt' }),
    getBasicProfile: () => ({
      getEmail: () => 'admin@example.com',
      getImageUrl: () => 'avatar.png',
      getName: () => 'Admin',
    }),
  };
  jest.mocked(getGapi).mockReturnValue({
    auth2: {
      getAuthInstance: () => ({ signIn: () => Promise.resolve(googleUser) }),
    },
  });
  fetchMock.post(authSettings.urlBase + '/auth/google', { id: 'admin-1' });
  const dispatch = jest.fn();
  const user = await new Promise(resolve => login(resolve)(dispatch));
  expect(user).toEqual({
    id: 'admin-1',
    email: 'admin@example.com',
    image: 'avatar.png',
    displayName: 'Admin',
    loggedIn: true,
  });
  expect(dispatch).toHaveBeenCalledWith({ type: 'USER_LOGIN', user });
  expect(setProfileMeta(user)).toEqual({ type: 'SET_PROFILE_META', user });
  expect(() =>
    handleFetchErrors({ ok: false, statusText: 'Unauthorized' }),
  ).toThrow('Unauthorized');
});

import { newMockStore } from '../Testing';
import {
  getUserBadges,
  getUserFeedBacks,
  sendAuthTokenToAPIServer,
  updateState,
} from './User';

const fetchMock = require('fetch-mock');
afterEach(() => fetchMock.restore());
// Login UI and silent session restoration moved to shared/auth. The app owns
// token registration and applying the resulting user to its store.
test('registers an auth token and returns the authenticated user', async () => {
  fetchMock.post('end:/auth/google', {
    id: 'u1',
    email: 'user@example.com',
    name: 'Player',
    lastLogin: '2020-01-01',
  });
  const user = await sendAuthTokenToAPIServer('jwt');
  expect(user).toEqual(expect.objectContaining({ id: 'u1', loggedIn: true }));
  expect(JSON.parse(fetchMock.lastOptions().body)).toEqual({ id_token: 'jwt' });
  expect(fetchMock.lastOptions().credentials).toBe('include');
});
test('rejects failed authentication for the login UI to handle', async () => {
  fetchMock.post('end:/auth/google', 500);
  await expect(sendAuthTokenToAPIServer('invalid')).rejects.toThrow(
    'Error authenticating',
  );
});
test('applies successful login, returns user to callback, and loads quest history', async () => {
  fetchMock.get('end:/user/quests', {
    history: { quest: { lastPlayed: 'today' } },
  });
  const store = newMockStore({});
  const user = { id: 'u1', loggedIn: true } as any;
  const callback = jest.fn();
  await updateState(store.dispatch)(user).then(callback);
  await fetchMock.flush(true);
  expect(callback).toHaveBeenCalledWith(user);
  expect(store.getActions()).toContainEqual({ type: 'USER_LOGIN', user });
  expect(store.getActions()).toContainEqual({
    type: 'USER_QUESTS',
    quests: { history: { quest: { lastPlayed: 'today' } } },
  });
});
test('clears user without requesting quest history when login returns null', async () => {
  const dispatch = jest.fn();
  expect(await updateState(dispatch)(null)).toBeNull();
  expect(dispatch.mock.calls).toEqual([[{ type: 'USER_LOGIN', user: null }]]);
});
describe.each([
  ['feedbacks', getUserFeedBacks, 'USER_FEEDBACKS', 'feedbacks'],
  ['badges', getUserBadges, 'USER_BADGES', 'badges'],
])('%s', (endpoint, action, type, key) => {
  test('loads authenticated user data', async () => {
    const data = ['example'];
    fetchMock.get('end:/user/' + endpoint, data);
    const store = newMockStore({});
    await store.dispatch((action as any)());
    expect(store.getActions()).toEqual([{ type, [key]: data }]);
    expect(fetchMock.lastOptions().credentials).toBe('include');
  });
  test('recovers quietly with an empty list on request failure', async () => {
    fetchMock.get('end:/user/' + endpoint, 500);
    const store = newMockStore({});
    await store.dispatch((action as any)());
    expect(store.getActions()).toEqual([{ type, [key]: [] }]);
  });
});

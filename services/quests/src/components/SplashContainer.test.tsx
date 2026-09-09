jest.mock('shared/auth/Web', () => ({ registerUserAndIdToken: jest.fn() }));
jest.mock('../actions/User', () => ({
  ensureToken: jest.fn(),
  postLoginUser: jest.fn(() => ({ type: 'LOGIN' })),
}));
jest.mock('../actions/Quest', () => ({
  loadQuestFromURL: jest.fn(() => ({ type: 'LOAD' })),
}));
import { registerUserAndIdToken } from 'shared/auth/Web';
import { loggedOutUser } from 'shared/auth/UserState';
import { ensureToken, postLoginUser } from '../actions/User';
import { loadQuestFromURL } from '../actions/Quest';
import { mapDispatchToProps } from './SplashContainer';
beforeEach(() => {
  jest.clearAllMocks();
  window.location.hash = '';
});
test('asynchronous sign-in only updates the session', async () => {
  (registerUserAndIdToken as jest.Mock).mockResolvedValue(loggedOutUser);
  await mapDispatchToProps(jest.fn()).onLogin('jwt');
  expect(postLoginUser).toHaveBeenCalledWith(loggedOutUser, '');
  expect(ensureToken).not.toHaveBeenCalled();
  expect(loadQuestFromURL).not.toHaveBeenCalled();
});

test('sign-in preserves a linked quest for automatic opening', async () => {
  window.location.hash = '#linked-quest';
  (registerUserAndIdToken as jest.Mock).mockResolvedValue(loggedOutUser);
  await mapDispatchToProps(jest.fn()).onLogin('jwt');
  expect(postLoginUser).toHaveBeenCalledWith(loggedOutUser, 'linked-quest');
  expect(ensureToken).not.toHaveBeenCalled();
});
test('new quest requests Drive immediately and clears an existing URL only after authorization', async () => {
  window.location.hash = '#existing';
  (ensureToken as jest.Mock).mockResolvedValue({ access_token: 'token' });
  const result = mapDispatchToProps(jest.fn()).onNewQuest(loggedOutUser);
  expect(ensureToken).toHaveBeenCalledWith(true);
  expect(loadQuestFromURL).not.toHaveBeenCalled();
  await result;
  expect(window.location.hash).toBe('');
  expect(loadQuestFromURL).toHaveBeenCalledWith(loggedOutUser);
});
test('blocked popup leaves the URL and loading state untouched and can be retried', async () => {
  window.location.hash = '#existing';
  (ensureToken as jest.Mock)
    .mockRejectedValueOnce(new Error('popup_failed_to_open'))
    .mockResolvedValueOnce({ access_token: 'token' });
  const dispatch = jest.fn();
  const actions = mapDispatchToProps(dispatch);
  await expect(actions.onOpenQuest!(loggedOutUser, 'existing')).rejects.toThrow(
    'popup_failed_to_open',
  );
  expect(window.location.hash).toBe('#existing');
  expect(dispatch).not.toHaveBeenCalled();
  await actions.onOpenQuest!(loggedOutUser, 'existing');
  expect(loadQuestFromURL).toHaveBeenCalledWith(loggedOutUser, 'existing');
});

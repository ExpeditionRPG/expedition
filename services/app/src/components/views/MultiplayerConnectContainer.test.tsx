jest.mock('../../actions/Multiplayer', () => ({
  multiplayerConnect: jest.fn(() => ({ type: 'TEST_CONNECT' })),
  multiplayerNewSession: jest.fn(() => ({ type: 'TEST_NEW' })),
}));
import { loggedOutUser } from 'shared/auth/UserState';
import {
  multiplayerConnect,
  multiplayerNewSession,
} from '../../actions/Multiplayer';
import { mapDispatchToProps } from './MultiplayerConnectContainer';

beforeEach(() => jest.clearAllMocks());
test.each([null, 'A', 'ABCDE'])(
  'rejects an incomplete session code %s without connecting',
  code => {
    jest.spyOn(window, 'prompt').mockReturnValue(code);
    const dispatch = jest.fn();
    mapDispatchToProps(dispatch).onConnect(loggedOutUser);
    expect(multiplayerConnect).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SNACKBAR_OPEN',
        message: expect.stringContaining('4 characters'),
      }),
    );
  },
);
test('normalizes joined and reconnected session codes', () => {
  jest.spyOn(window, 'prompt').mockReturnValue('abCd');
  const props = mapDispatchToProps(jest.fn());
  props.onConnect(loggedOutUser);
  expect(multiplayerConnect).toHaveBeenCalledWith(loggedOutUser, 'ABCD');
  props.onReconnect(loggedOutUser, 'session-id', 'wxyz');
  expect(multiplayerConnect).toHaveBeenLastCalledWith(loggedOutUser, 'WXYZ');
  props.onNewSessionRequest(loggedOutUser);
  expect(multiplayerNewSession).toHaveBeenCalledWith(loggedOutUser);
});

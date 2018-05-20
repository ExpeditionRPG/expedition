import {login, silentLogin, UserLoginCallback} from './User'
import {testLoggedInUser} from '../reducers/User.test'
import {newMockStore} from '../Testing'

describe('User actions', () => {
  let store = null as any;
    const mockLogin = (callback: UserLoginCallback) => {
    return callback(testLoggedInUser);
  };

  beforeEach(() => {
    store = newMockStore({});
  });

  describe('silentLogin', () => {
    it('swallows login errors');

    it('calls callback on success', () => {
      const callback = jasmine.createSpyObj('callback', ['success']);
      store.dispatch(silentLogin({callback: callback.success}, mockLogin));
      expect(callback.success).toHaveBeenCalledTimes(1);
    });

    it('loads user quest info on success');
  });

  describe('login', () => {
    it('shows snackbar on login failure');

    it('dispatches USER_LOGIN on successful login');

    it('calls callback on success', () => {
      const callback = jasmine.createSpyObj('callback', ['success']);
      store.dispatch(login({callback: callback.success}, mockLogin));
      expect(callback.success).toHaveBeenCalledTimes(1);
    });

    it('loads user quest info on success');
  });

  describe('logout', () => {
    it('logs out the user');
  });
});

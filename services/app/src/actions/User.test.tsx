import {newMockStore} from '../Testing';
import {ensureLogin, silentLogin} from './User';

describe('User actions', () => {
  test.skip('TODO', () => { /* TODO */ });

  describe('silentLogin', () => {
    test.skip('swallows login errors', () => { /* TODO */ });

    test.skip('calls callback on success', () => {
      const store = newMockStore({});
      const callback = jasmine.createSpyObj('callback', ['success']);
      store.dispatch(silentLogin());
      expect(callback.success).toHaveBeenCalledTimes(1);
    });

    test.skip('loads user quest info on success', () => { /* TODO */ });
  });

  describe('ensureLogin', () => {
    test.skip('shows snackbar on login failure', () => { /* TODO */ });

    test.skip('dispatches USER_LOGIN on successful login', () => { /* TODO */ });

    test.skip('calls callback on success', () => {
      const store = newMockStore({});
      const callback = jasmine.createSpyObj('callback', ['success']);
      store.dispatch(ensureLogin())
        .then(callback.success);
      expect(callback.success).toHaveBeenCalledTimes(1);
    });

    test.skip('loads user quest info on success', () => { /* TODO */ });
  });
});

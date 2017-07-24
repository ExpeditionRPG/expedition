
describe('User action', () => {
  describe('silentLogin', () => {
    it('swallows login errors');
  });

  describe('login', () => {
    it('shows snackbar on login failure');

    it('dispatches USER_LOGIN on successful login');

    it('calls callback on successful login');
  });

  describe('logout', () => {
    it('logs out the user');
  });
});

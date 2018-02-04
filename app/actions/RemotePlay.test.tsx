describe('RemotePlay actions', () => {
  describe('handleRemotePlayEvent', () => {
    it('does not dispatch INTERACTION events');
    it('resolves and dispatches ACTION events');
    it('shows a snackbar on ERROR events');
    it('safely handles unknown events');
  });

  describe('remotePlayNewSession', () => {
    it('creates a new session');
    it('catches and logs web errors');
  });

  describe('remotePlayConnect', () => {
    it('connects to a session');
    it('catches and logs web errors');
  });

  describe('loadRemotePlay', () => {
    it('fetches past sessions by user id');
    it('catches and logs web errors');
  });
});

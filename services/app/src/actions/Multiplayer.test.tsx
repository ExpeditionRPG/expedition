describe('Multiplayer actions', () => {
  describe('routeEvent', () => {
    it('does not dispatch INTERACTION events');
    it('resolves and dispatches ACTION events');
    it('shows a snackbar on ERROR events');
    it('safely handles unknown events');
    it('rejects COMMIT when no matching inflight action');
    it('rejects REJECT when no matching inflight action');
    it('rejects ACTIONs when id is not an increment');
  });

  describe('multiplayerNewSession', () => {
    it('creates a new session');
    it('catches and logs web errors');
  });

  describe('multiplayerConnect', () => {
    it('connects to a session');
    it('catches and logs web errors');
  });

  describe('loadMultiplayer', () => {
    it('fetches past sessions by user id');
    it('catches and logs web errors');
  });
});

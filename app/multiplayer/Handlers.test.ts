describe('multiplayer handlers', () => {
  describe('websocketSession', () => {
    it('returns an error on unparseable websocket messages');
    it('ignores PING messages');
    it('simply broadcasts non-ACTION events');
    it('handles client status messages');
    it('notifies on ACTION commit success');
    it('notifies on ACTION commit failure (with conflicting actions)');
    it('broadcasts client disconnection');
  });

  describe('handleClientStatus', () => {
    it('updates in-memory session info with client status');
    it('broadcasts handleCombatTimerStop if all clients are waiting on combat timer results');
  });

  describe('verifyWebsocket', () => {
    it('accepts if valid WS params');
    it('rejects if session is locked');
    it('rejects if secret not matched');
  });

  describe('user', () => {
    it('fetches user history');
    it('returns error if user details not found');
  });

  describe('newSession', () => {
    it('creates a new session');
    it('returns the session\'s secret');
  });

  describe('connect', () => {
    it('adds session client to DB on successful connection');
    it('returns the session ID for websocket connection');
    it('returns error if session connection fails');
  });
});

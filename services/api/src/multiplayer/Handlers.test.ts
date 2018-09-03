describe('multiplayer handlers', () => {
  describe('websocketSession', () => {
    test.skip('returns an error on unparseable websocket messages', () => { /* TODO */ });
    test.skip('simply broadcasts non-ACTION events', () => { /* TODO */ });
    test.skip('handles client status messages', () => { /* TODO */ });
    test.skip('notifies on ACTION commit success', () => { /* TODO */ });
    test.skip('notifies on ACTION commit failure (with conflicting actions)', () => { /* TODO */ });
    test.skip('broadcasts client disconnection', () => { /* TODO */ });
  });

  describe('handleClientStatus', () => {
    test.skip('updates in-memory session info with client status', () => { /* TODO */ });
    test.skip('broadcasts handleCombatTimerStop if all clients are waiting on combat timer results', () => { /* TODO */ });
  });

  describe('verifyWebsocket', () => {
    test.skip('accepts if valid WS params', () => { /* TODO */ });
    test.skip('rejects if session is locked', () => { /* TODO */ });
    test.skip('rejects if secret not matched', () => { /* TODO */ });
  });

  describe('user', () => {
    test.skip('fetches user history', () => { /* TODO */ });
    test.skip('returns error if user details not found', () => { /* TODO */ });
  });

  describe('newSession', () => {
    test.skip('creates a new session', () => { /* TODO */ });
    test.skip('returns the session\'s secret', () => { /* TODO */ });
  });

  describe('connect', () => {
    test.skip('adds session client to DB on successful connection', () => { /* TODO */ });
    test.skip('returns the session ID for websocket connection', () => { /* TODO */ });
    test.skip('returns 404 if connection not found', () => { /* TODO */ });
    test.skip('returns error if session connection fails', () => { /* TODO */ });
  });
});

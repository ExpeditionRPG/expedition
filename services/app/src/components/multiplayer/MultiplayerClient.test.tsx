import {newMockStore} from './Testing';
import {MultiplayerClient} from './Multiplayer';

describe('Multiplayer', () => {
  describe('routeEvent', () => {
    test.skip('does not dispatch INTERACTION events', () => { /* TODO */ });
    test.skip('resolves and dispatches ACTION events', () => { /* TODO */ });
    test.skip('shows a snackbar on ERROR events', () => { /* TODO */ });
    test.skip('safely handles unknown events', () => { /* TODO */ });
    test.skip('rejects COMMIT when no matching inflight action', () => { /* TODO */ });
    test.skip('rejects REJECT when no matching inflight action', () => { /* TODO */ });
    test.skip('rejects ACTIONs when id is not an increment', () => { /* TODO */ });
    test.skip('handles MULTI_EVENT', () => { /* TODO */});
  });
});

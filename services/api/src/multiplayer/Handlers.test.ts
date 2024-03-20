import { StatusEvent } from 'shared/multiplayer/Events';
import { toClientKey } from 'shared/multiplayer/Session';
import { testingDBWithState } from '../models/TestData';
import { handleClientStatus } from './Handlers';
import { getSession, resetSessions } from './Sessions';
import { newMockWebsocket } from './TestData';

const TEST_SESSION = 123;
const TEST_CLIENT = 'abc';
const TEST_INSTANCE = 'def';

describe('multiplayer handlers', () => {
  beforeEach(() => {
    resetSessions();
  });

  describe('websocketSession', () => {
    test.skip('returns an error on unparseable websocket messages', () => {
      /* TODO */
    });
    test.skip('simply broadcasts non-ACTION events', () => {
      /* TODO */
    });
    test.skip('handles client status messages', () => {
      /* TODO */
    });
    test.skip('notifies on ACTION commit success', () => {
      /* TODO */
    });
    test.skip('notifies on ACTION commit failure (with conflicting actions)', () => {
      /* TODO */
    });
    test.skip('broadcasts client disconnection', () => {
      /* TODO */
    });
  });

  describe('handleClientStatus', () => {
    const TEST_STATUS: StatusEvent = { type: 'STATUS', connected: true };
    test('updates in-memory session info with client status', done => {
      const ws = newMockWebsocket();
      testingDBWithState([])
        .then(db => {
          return handleClientStatus(
            db,
            TEST_SESSION,
            TEST_CLIENT,
            TEST_INSTANCE,
            TEST_STATUS,
            ws,
          );
        })
        .then(() => {
          expect(
            getSession(TEST_SESSION)[toClientKey(TEST_CLIENT, TEST_INSTANCE)]
              .status,
          ).toEqual(TEST_STATUS);
          done();
        })
        .catch(done.fail);
    });
    test('checks for wait on review/timer, fast forward', done => {
      // Note: WaitingOn.test.ts tests handleCombatTimerStop in more detail; we just want to ensure it's called.
      const combatStopStatus = {
        ...TEST_STATUS,
        waitingOn: { elapsedMillis: 500, type: 'TIMER' },
        lastEventID: 5,
      };
      const waitingOnTimer = jest.fn();
      const waitingOnReview = jest.fn();
      const maybeFastForward = jest.fn();
      testingDBWithState([])
        .then(db => {
          return handleClientStatus(
            db,
            TEST_SESSION,
            TEST_CLIENT,
            TEST_INSTANCE,
            combatStopStatus,
            newMockWebsocket(),
            waitingOnTimer,
            waitingOnReview,
            maybeFastForward,
          );
        })
        .then(() => {
          expect(waitingOnTimer).toHaveBeenCalledTimes(1);
          expect(waitingOnReview).toHaveBeenCalledTimes(1);
          expect(maybeFastForward).toHaveBeenCalledTimes(1);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('maybeFastForwardClient', () => {
    test.skip('sends most recent event if client is behind', () => {
      // Note: WaitingOn.test.ts tests handleCombatTimerStop in more detail; we just want to ensure it's called.
      const combatStopStatus = {
        ...TEST_STATUS,
        waitingOn: { elapsedMillis: 500, type: 'TIMER' },
        lastEventID: 5,
      };
      const waitingOnTimer = jest.fn();
      const waitingOnReview = jest.fn();
      const maybeFastForward = jest.fn();
      testingDBWithState([])
        .then(db => {
          return handleClientStatus(
            db,
            TEST_SESSION,
            TEST_CLIENT,
            TEST_INSTANCE,
            combatStopStatus,
            newMockWebsocket(),
            waitingOnTimer,
            waitingOnReview,
            maybeFastForward,
          );
        })
        .then(() => {
          expect(waitingOnTimer).toHaveBeenCalledTimes(1);
          expect(waitingOnReview).toHaveBeenCalledTimes(1);
          expect(maybeFastForward).toHaveBeenCalledTimes(1);
          done();
        })
        .catch(done.fail);
    });
    test.skip('does nothing if client is caught up', () => {
      /* TODO */
    });
    test.skip('does nothing if there is no event', () => {
      /* TODO */
    });
  });

  describe('verifyWebsocket', () => {
    test.skip('accepts if valid WS params', () => {
      /* TODO */
    });
    test.skip('rejects if session is locked', () => {
      /* TODO */
    });
    test.skip('rejects if secret not matched', () => {
      /* TODO */
    });
  });

  describe('user', () => {
    test.skip('fetches user history', () => {
      /* TODO */
    });
    test.skip('returns error if user details not found', () => {
      /* TODO */
    });
  });

  describe('newSession', () => {
    test.skip('creates a new session', () => {
      /* TODO */
    });
    test.skip("returns the session's secret", () => {
      /* TODO */
    });
  });

  describe('connect', () => {
    test.skip('adds session client to DB on successful connection', () => {
      /* TODO */
    });
    test.skip('returns the session ID for websocket connection', () => {
      /* TODO */
    });
    test.skip('returns 404 if connection not found', () => {
      /* TODO */
    });
    test.skip('returns error if session connection fails', () => {
      /* TODO */
    });
  });
});

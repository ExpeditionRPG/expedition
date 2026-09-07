import { websocketSession } from './Handlers';
import { resetSessions } from './Sessions';

// A stand-in for a `ws` server socket that captures the listeners
// websocketSession registers, so a test can deliver a frame the way ws itself
// would: `(data: Buffer, isBinary: boolean)`.
function fakeSocket() {
  const listeners: { [event: string]: (...args: any[]) => any } = {};
  return {
    readyState: 1, // WebSocket.OPEN
    send: jest.fn(),
    on(event: string, cb: (...args: any[]) => any) {
      listeners[event] = cb;
      return this;
    },
    deliver(event: string, ...args: any[]) {
      return listeners[event](...args);
    },
  };
}

const SESSION = 4242;
function fakeRequest() {
  return {
    url: `/ws/multiplayer/v1/session/${SESSION}?client=c1&instance=i1&secret=s1`,
  };
}

function sentEvents(ws: ReturnType<typeof fakeSocket>): any[] {
  return ws.send.mock.calls.map((c: any[]) => JSON.parse(c[0]));
}

describe('multiplayer handlers', () => {
  describe('websocketSession', () => {
    afterEach(resetSessions);

    // ws 7 handed text frames to the 'message' listener already decoded to a
    // string; ws 8 always hands over raw bytes plus an `isBinary` flag. These
    // two pin that down, because a socket mocked at a higher level cannot.
    test('accepts text frames delivered as raw bytes', () => {
      const ws = fakeSocket();
      websocketSession({} as any, ws as any, fakeRequest() as any);
      const msg = JSON.stringify({
        client: 'c1',
        event: { type: 'MULTI_EVENT', events: [], lastId: 0 },
        id: null,
        instance: 'i1',
      });
      ws.deliver('message', Buffer.from(msg, 'utf8'), false);

      // Non-ACTION events are broadcast verbatim to the session's clients,
      // which here is just this socket.
      expect(ws.send).toHaveBeenCalled();
      const events = sentEvents(ws);
      expect(events.map(e => e.event.type)).not.toContain('ERROR');
      expect(events).toContainEqual(JSON.parse(msg));
    });

    test('rejects binary frames', () => {
      const ws = fakeSocket();
      websocketSession({} as any, ws as any, fakeRequest() as any);
      ws.deliver('message', Buffer.from([0x00, 0x01, 0x02]), true);

      const events = sentEvents(ws);
      expect(events.length).toEqual(1);
      expect(events[0].event.type).toEqual('ERROR');
      expect(events[0].event.error).toContain(
        'Invalid type for inbound message',
      );
    });

    test('returns an error on unparseable websocket messages', () => {
      const ws = fakeSocket();
      websocketSession({} as any, ws as any, fakeRequest() as any);
      ws.deliver('message', Buffer.from('not json at all', 'utf8'), false);

      const events = sentEvents(ws);
      expect(events.length).toEqual(1);
      expect(events[0].event.type).toEqual('ERROR');
      expect(events[0].event.error).toContain('Could not parse inbound event');
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
    test.skip('updates in-memory session info with client status', () => {
      /* TODO */
    });
    test.skip('broadcasts handleCombatTimerStop if all clients are waiting on combat timer results', () => {
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

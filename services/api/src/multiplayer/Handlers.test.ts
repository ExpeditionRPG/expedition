import { SessionClient } from 'shared/schema/multiplayer/SessionClients';
import { toClientKey } from 'shared/multiplayer/Session';
import { Event } from 'shared/schema/multiplayer/Events';
import { Session } from 'shared/schema/multiplayer/Sessions';
import {
  events as e,
  sessions as s,
  TEST_NOW,
  testingDBWithState,
} from '../models/TestData';
import {
  connect,
  newSession,
  user,
  verifyWebsocket,
  websocketSession,
} from './Handlers';
import { getSession, initSessionClient, resetSessions } from './Sessions';

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

function response() {
  const res: any = {
    locals: { id: 'c1' },
    status: jest.fn(),
    end: jest.fn(),
    send: jest.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
}
const flush = () => new Promise(resolve => setTimeout(resolve, 75));
const status = {
  client: 'c1',
  instance: 'i1',
  id: null,
  event: { type: 'STATUS', connected: true },
};
describe('multiplayer handlers', () => {
  afterEach(resetSessions);
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
        event: { type: 'STATUS', connected: true },
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

    test('simply broadcasts non-ACTION events', async () => {
      const ws = fakeSocket();
      const peer = fakeSocket();
      websocketSession({} as any, ws as any, fakeRequest() as any);
      initSessionClient(SESSION, 'c2', 'i2', peer as any);
      ws.deliver('message', Buffer.from(JSON.stringify(status)), false);
      expect(sentEvents(peer)).toContainEqual(status);
    });
    test('handles client status messages', async () => {
      const ws = fakeSocket();
      websocketSession({} as any, ws as any, fakeRequest() as any);
      ws.deliver('message', Buffer.from(JSON.stringify(status)), false);
      expect(getSession(SESSION)![toClientKey('c1', 'i1')].status).toEqual(
        status.event,
      );
    });
    test('notifies on ACTION commit success', async () => {
      const db = await testingDBWithState([
        new Session({ ...s.basic, id: SESSION, eventCounter: 0 }),
      ]);
      const ws = fakeSocket();
      websocketSession(db, ws as any, fakeRequest() as any);
      const msg = {
        ...status,
        id: 1,
        event: { type: 'ACTION', name: 'navigate', args: '{}' },
      };
      ws.deliver('message', Buffer.from(JSON.stringify(msg)), false);
      await flush();
      expect(sentEvents(ws)).toContainEqual(msg);
      expect(
        await db.events.count({ where: { session: SESSION, id: 1 } }),
      ).toBe(1);
    });
    // A client whose ACTION loses the race for an event id has to be told what
    // actually won that id, or it can never reconcile. The catch-up therefore
    // has to *include* the contested id, which means asking for events after
    // `id - 1`. Asking for events after `id` -- what this did until the QA
    // round that found it -- returns an empty MULTI_EVENT with `lastId: 0`
    // whenever the contested id is the newest one, which is the common case.
    test('notifies on ACTION commit failure (with conflicting actions)', () => {
      const ws = fakeSocket();
      const winner = JSON.stringify({
        client: 'other-client',
        event: { args: '{"winner":true}', name: 'NAVIGATE', type: 'ACTION' },
        id: 2,
        instance: 'other-instance',
      });
      return testingDBWithState([
        new Session({ ...s.basic, id: SESSION }),
        new Event({
          ...e.basic,
          id: 1,
          json: '{"first":true}',
          session: SESSION,
          timestamp: new Date(TEST_NOW.getTime() + 1000),
        }),
        new Event({
          ...e.basic,
          id: 2,
          json: winner,
          session: SESSION,
          timestamp: new Date(TEST_NOW.getTime() + 2000),
        }),
      ])
        .then(db => {
          websocketSession(db, ws as any, fakeRequest() as any);
          ws.send.mockClear();
          // c1 tries to claim id 2, which other-client already holds.
          return ws.deliver(
            'message',
            Buffer.from(
              JSON.stringify({
                client: 'c1',
                event: {
                  args: '{"loser":true}',
                  name: 'NAVIGATE',
                  type: 'ACTION',
                },
                id: 2,
                instance: 'i1',
              }),
            ),
            false,
          );
        })
        .then(() => new Promise(resolve => setTimeout(resolve, 50)))
        .then(() => {
          const multi = sentEvents(ws)
            .map(m => m.event)
            .find(ev => ev && ev.type === 'MULTI_EVENT');
          expect(multi).toBeDefined();
          // The contested event itself must come back...
          expect(multi.events).toHaveLength(1);
          expect(JSON.parse(multi.events[0]).event.args).toEqual(
            '{"winner":true}',
          );
          // ...and lastId must name it, not 0.
          expect(multi.lastId).toEqual(2);
        });
    });
    test('broadcasts client disconnection', async () => {
      const ws = fakeSocket();
      const peer = fakeSocket();
      websocketSession({} as any, ws as any, fakeRequest() as any);
      initSessionClient(SESSION, 'peer', 'other', peer as any);
      ws.deliver('close');
      expect(getSession(SESSION)![toClientKey('c1', 'i1')]).toBeUndefined();
      expect(sentEvents(peer)[0]).toMatchObject({
        client: 'c1',
        event: { type: 'STATUS', connected: false },
      });
    });
  });

  describe('handleClientStatus', () => {
    test('updates in-memory session info with client status', async () => {
      const ws = fakeSocket();
      websocketSession({} as any, ws as any, fakeRequest() as any);
      const message = {
        ...status,
        event: { ...status.event, name: 'Alice', waitingOn: { type: 'READY' } },
      };
      ws.deliver('message', Buffer.from(JSON.stringify(message)), false);
      expect(getSession(SESSION)![toClientKey('c1', 'i1')].status).toEqual(
        message.event,
      );
    });
    test('broadcasts handleCombatTimerStop if all clients are waiting on combat timer results', async () => {
      const db = await testingDBWithState([
        new Session({ ...s.basic, id: SESSION, eventCounter: 0 }),
      ]);
      const ws = fakeSocket();
      websocketSession(db, ws as any, fakeRequest() as any);
      ws.deliver(
        'message',
        Buffer.from(
          JSON.stringify({
            ...status,
            event: {
              ...status.event,
              waitingOn: { type: 'TIMER', elapsedMillis: 1234 },
            },
          }),
        ),
        false,
      );
      await flush();
      const action = sentEvents(ws).find(
        m => m.event.name === 'handleCombatTimerStop',
      );
      expect(JSON.parse(action.event.args)).toMatchObject({
        elapsedMillis: 1234,
      });
      expect(action.id).toBe(1);
    });
  });

  describe('verifyWebsocket', () => {
    test('accepts if valid WS params', async () => {
      const db = await testingDBWithState([
        new Session({ ...s.basic, id: SESSION }),
        new SessionClient({ session: SESSION, client: 'c1', secret: 's1' }),
      ]);
      const cb = jest.fn();
      await verifyWebsocket(db, { req: fakeRequest() } as any, cb);
      expect(cb).toHaveBeenCalledWith(true);
    });
    test('rejects if session is locked', async () => {
      const db = await testingDBWithState([
        new Session({ ...s.basic, id: SESSION, locked: true }),
        new SessionClient({ session: SESSION, client: 'c1', secret: 's1' }),
      ]);
      const cb = jest.fn();
      await verifyWebsocket(db, { req: fakeRequest() } as any, cb);
      expect(cb).toHaveBeenCalledWith(false);
    });
    test('rejects if secret not matched', async () => {
      const db = await testingDBWithState([
        new SessionClient({ session: SESSION, client: 'c1', secret: 'wrong' }),
      ]);
      const cb = jest.fn();
      await verifyWebsocket(db, { req: fakeRequest() } as any, cb);
      expect(cb).toHaveBeenCalledWith(false);
    });
  });

  describe('user', () => {
    test('fetches user history', async () => {
      const db = await testingDBWithState([
        new SessionClient({ session: SESSION, client: 'c1', secret: 's1' }),
        new Event({
          ...e.basic,
          session: SESSION,
          json: JSON.stringify({
            event: {
              name: 'fetchQuestXML',
              args: JSON.stringify({ title: 'Adventure' }),
            },
          }),
        }),
      ]);
      initSessionClient(SESSION, 'peer', 'instance', fakeSocket() as any);
      const res = response();
      await user(db, {} as any, res);
      expect(JSON.parse(res.end.mock.calls[0][0]).history).toEqual([
        expect.objectContaining({
          id: SESSION,
          questTitle: 'Adventure',
          peerCount: 1,
          secret: 's1',
        }),
      ]);
    });
    test('returns error if user details not found', async () => {
      const res = response();
      await user(
        {
          sessionClients: {
            findAll: () => Promise.reject(new Error('offline')),
          },
        } as any,
        {} as any,
        res,
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.end.mock.calls[0][0]).toContain('offline');
    });
  });

  describe('newSession', () => {
    test('creates a new session', async () => {
      const db = await testingDBWithState([]);
      const res = response();
      await newSession(db, {} as any, res);
      const rows = await db.sessions.findAll();
      expect(rows).toHaveLength(1);
      expect(rows[0].get('eventCounter')).toBe(0);
      expect(rows[0].get('locked')).toBe(false);
    });
    test("returns the session's secret", async () => {
      const db = await testingDBWithState([]);
      const res = response();
      await newSession(db, {} as any, res);
      const row = await db.sessions.findOne();
      expect(JSON.parse(res.end.mock.calls[0][0]).secret).toBe(
        row!.get('secret'),
      );
      expect(row!.get('secret').length).toBeGreaterThan(0);
    });
  });

  describe('connect', () => {
    test('adds session client to DB on successful connection', async () => {
      const db = await testingDBWithState([
        new Session({ ...s.basic, id: SESSION, secret: 's1' }),
      ]);
      const res = response();
      await connect(db, { body: '{"secret":"s1"}' } as any, res);
      const row = await db.sessionClients.findOne({
        where: { session: SESSION, client: 'c1' },
      });
      expect(row!.get('secret')).toBe('s1');
    });
    test('returns the session ID for websocket connection', async () => {
      const db = await testingDBWithState([
        new Session({ ...s.basic, id: SESSION, secret: 's1' }),
      ]);
      const res = response();
      await connect(db, { body: '{"secret":"s1"}' } as any, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(JSON.parse(res.end.mock.calls[0][0])).toEqual({
        session: SESSION,
      });
    });
    test('returns 404 if connection not found', async () => {
      const db = await testingDBWithState([]);
      const res = response();
      await connect(db, { body: '{"secret":"missing"}' } as any, res);
      expect(res.status.mock.calls).toEqual([[404]]);
      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.end).not.toHaveBeenCalled();
    });
    test('returns error if session connection fails', async () => {
      const res = response();
      await connect(
        {
          sessions: { findOne: () => Promise.reject(new Error('offline')) },
        } as any,
        { body: '{"secret":"s1"}' } as any,
        res,
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.end.mock.calls[0][0]).toContain('offline');
    });
  });
});

describe('socket identity and reconnect regressions', () => {
  afterEach(resetSessions);
  test('closing a replaced socket preserves the reconnected client', () => {
    const old = fakeSocket();
    const current = fakeSocket();
    websocketSession({} as any, old as any, fakeRequest() as any);
    websocketSession({} as any, current as any, fakeRequest() as any);
    old.deliver('close');
    expect(getSession(SESSION)![toClientKey('c1', 'i1')].socket).toBe(current);
    expect(current.send).not.toHaveBeenCalled();
  });
  test('rejects peer impersonation before broadcasting or changing status', () => {
    const ws = fakeSocket();
    websocketSession({} as any, ws as any, fakeRequest() as any);
    ws.deliver(
      'message',
      Buffer.from(JSON.stringify({ ...status, client: 'victim' })),
      false,
    );
    expect(sentEvents(ws)[0].event.type).toBe('ERROR');
    expect(Object.keys(getSession(SESSION)!)).toEqual([
      toClientKey('c1', 'i1'),
    ]);
  });
  test.each([undefined, null, 0, -1, 1.5, '1'])(
    'rejects invalid ACTION id %p',
    id => {
      const ws = fakeSocket();
      websocketSession({} as any, ws as any, fakeRequest() as any);
      ws.deliver(
        'message',
        Buffer.from(
          JSON.stringify({ ...status, id, event: { type: 'ACTION' } }),
        ),
        false,
      );
      expect(sentEvents(ws)[0].event.type).toBe('ERROR');
    },
  );
});

describe('websocket envelope and replacement isolation', () => {
  afterEach(resetSessions);
  test.each([
    { id: null, event: { type: 'MULTI_EVENT', events: [], lastId: 9 } },
    { id: 1, event: { type: 'INFLIGHT_COMMIT' } },
    { id: 1, event: { type: 'STATUS', connected: true } },
    { id: null, event: { type: 'STATUS', lastEventID: 'bad' } },
    { id: 1, event: { type: 'ACTION', name: 'navigate', args: 'not json' } },
    { id: 1, event: { type: 'ACTION', name: 'navigate', args: {} } },
  ])(
    'rejects malformed or server-only frames before broadcasting %j',
    delta => {
      const ws = fakeSocket(),
        peer = fakeSocket();
      websocketSession({} as any, ws as any, fakeRequest() as any);
      initSessionClient(SESSION, 'peer', 'other', peer as any);
      ws.deliver(
        'message',
        Buffer.from(JSON.stringify({ ...status, ...delta })),
        false,
      );
      expect(sentEvents(ws)).toEqual([
        expect.objectContaining({
          event: expect.objectContaining({ type: 'ERROR' }),
        }),
      ]);
      expect(peer.send).not.toHaveBeenCalled();
    },
  );
  test('ignores frames queued by a replaced socket', () => {
    const old = fakeSocket(),
      replacement = fakeSocket(),
      peer = fakeSocket();
    websocketSession({} as any, old as any, fakeRequest() as any);
    websocketSession({} as any, replacement as any, fakeRequest() as any);
    initSessionClient(SESSION, 'peer', 'other', peer as any);
    replacement.deliver('message', Buffer.from(JSON.stringify(status)), false);
    peer.send.mockClear();
    old.deliver(
      'message',
      Buffer.from(
        JSON.stringify({
          ...status,
          event: { type: 'STATUS', connected: false },
        }),
      ),
      false,
    );
    expect(getSession(SESSION)![toClientKey('c1', 'i1')]).toEqual(
      expect.objectContaining({ socket: replacement, status: status.event }),
    );
    expect(peer.send).not.toHaveBeenCalled();
  });
});

describe('websocket asynchronous failure handling', () => {
  afterEach(resetSessions);
  test.each([
    'TIMER',
    { type: 'TIMER' },
    { type: 'TIMER', elapsedMillis: '100' },
    { type: 'TIMER', elapsedMillis: -1 },
  ])('rejects malformed waiting status %j', waitingOn => {
    const ws = fakeSocket(),
      peer = fakeSocket();
    websocketSession({} as any, ws as any, fakeRequest() as any);
    initSessionClient(SESSION, 'peer', 'other', peer as any);
    ws.deliver(
      'message',
      Buffer.from(
        JSON.stringify({ ...status, event: { ...status.event, waitingOn } }),
      ),
      false,
    );
    expect(sentEvents(ws)[0].event).toMatchObject({
      type: 'ERROR',
      error: 'Invalid STATUS fields',
    });
    expect(peer.send).not.toHaveBeenCalled();
  });
  test('does not send conflict catchup after the socket has closed', async () => {
    const db = await testingDBWithState([
      new Session({ ...s.basic, id: SESSION, eventCounter: 0 }),
    ]);
    try {
      const ws = fakeSocket();
      websocketSession(db, ws as any, fakeRequest() as any);
      ws.deliver(
        'message',
        Buffer.from(
          JSON.stringify({
            ...status,
            id: 2,
            event: { type: 'ACTION', name: 'navigate', args: '{}' },
          }),
        ),
        false,
      );
      ws.readyState = 3;
      ws.deliver('close');
      await flush();
      expect(ws.send).not.toHaveBeenCalled();
    } finally {
      await db.sequelize.close();
    }
  });
  test('handles catchup database failure without sending a malformed null event', async () => {
    const db: any = {
      events: {
        findOne: jest.fn().mockRejectedValue(new Error('database unavailable')),
      },
    };
    const ws = fakeSocket();
    websocketSession(db, ws as any, fakeRequest() as any);
    ws.deliver(
      'message',
      Buffer.from(
        JSON.stringify({
          ...status,
          event: { ...status.event, lastEventID: 0 },
        }),
      ),
      false,
    );
    await flush();
    expect(sentEvents(ws).filter(e => e.event.type === 'ERROR')).toEqual([
      expect.objectContaining({
        event: { type: 'ERROR', error: 'Error: database unavailable' },
      }),
    ]);
  });
  test('does not recursively report transport errors on a failed socket', () => {
    const ws = fakeSocket();
    websocketSession({} as any, ws as any, fakeRequest() as any);
    ws.send.mockImplementation((_data: any, cb: any) =>
      cb(new Error('transport closed')),
    );
    expect(() =>
      ws.deliver('message', Buffer.from('invalid json'), false),
    ).not.toThrow();
    expect(ws.send).toHaveBeenCalledTimes(1);
  });
});

test('accepts a no-card status and explicit cleared waiting state', () => {
  const ws = fakeSocket();
  websocketSession({} as any, ws as any, fakeRequest() as any);
  const message = {
    ...status,
    event: { ...status.event, line: -1, waitingOn: null },
  };
  try {
    ws.deliver('message', Buffer.from(JSON.stringify(message)), false);
    expect(sentEvents(ws)).toContainEqual(message);
    expect(sentEvents(ws).some(e => e.event.type === 'ERROR')).toBe(false);
  } finally {
    resetSessions();
  }
});

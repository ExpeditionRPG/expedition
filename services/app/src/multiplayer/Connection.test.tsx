import { Server } from 'mock-socket';
import { Connection } from './Connection';

jest.useFakeTimers();

// Must match MULTIPLAYER_SETTINGS.websocketSession exactly, scheme included,
// or mock-socket's network bridge never hands the client to the server.
const testURL =
  'wss://betaapi.expeditiongame.com/ws/multiplayer/v1/session/testsession?client=testid&instance=testinstance&secret=scrt';

// Every socket the mock server accepted, and every message it received,
// in order. Reset by beforeEach below.
const serverSockets: any[] = [];
const serverMessages: string[] = [];

const mockServer = new Server(testURL);
mockServer.on('connection', socket => {
  serverSockets.push(socket);
  socket.on('message', data => {
    serverMessages.push(String(data));
  });
});

// mock-socket delivers open/close/message asynchronously via setTimeout, and
// Connection schedules its reconnect on a timer too. Flushing repeatedly walks
// the whole chain (close -> backoff -> connect -> open) under fake timers.
function flush(times = 5) {
  for (let i = 0; i < times; i++) {
    jest.advanceTimersByTime(1000);
  }
}

describe('Connection', () => {
  describe('replacing a socket', () => {
    interface SocketMock {
      close: jest.Mock<void, [code?: number]>;
      send: jest.Mock<void, [data: string]>;
      onopen: () => void;
      onclose: (event: CloseEvent) => void;
      onmessage: (event: MessageEvent) => void;
    }

    function setup() {
      jest.clearAllTimers();
      const sockets: SocketMock[] = [];
      jest.spyOn(global, 'WebSocket').mockImplementation(() => {
        const socket: SocketMock = {
          close: jest.fn(),
          send: jest.fn(),
          onopen: jest.fn(),
          onclose: jest.fn(),
          onmessage: jest.fn(),
        };
        sockets.push(socket);
        return socket as WebSocket;
      });
      const handler = {
        onConnectionChange: jest.fn(),
        onReject: jest.fn(),
        onEvent: jest.fn(),
      };
      const c = new Connection(() => Promise.resolve(true));
      c.registerHandler(handler);
      c.configure('testid', 'testinstance');
      c.connect('first', 'secret');
      sockets[0].onopen();
      return { c, handler, sockets };
    }

    afterEach(() => jest.clearAllTimers());

    test('does not report a connecting or closed socket online just because HTTP is reachable', async () => {
      const { c, handler, sockets } = setup();
      Object.assign(sockets[0], { readyState: 3 });
      await c.checkOnlineState();
      expect(c.isConnected()).toBe(false);
      c.connect('first', 'secret');
      Object.assign(sockets[1], { readyState: 0 });
      handler.onConnectionChange.mockClear();
      await c.checkOnlineState();
      expect(c.isConnected()).toBe(false);
      expect(handler.onConnectionChange).not.toHaveBeenCalled();
      Object.assign(sockets[1], { readyState: 1 });
      sockets[1].onopen();
      expect(c.isConnected()).toBe(true);
    });
    test('ignores a pending open or message callback after disconnect', () => {
      const { c, handler, sockets } = setup();
      c.disconnect();
      handler.onConnectionChange.mockClear();
      sockets[0].onopen();
      sockets[0].onmessage(
        new MessageEvent('message', {
          data: JSON.stringify({
            client: 'peer',
            instance: 'tab',
            id: null,
            event: { type: 'STATUS', connected: true },
          }),
        }),
      );
      expect(c.isConnected()).toBe(false);
      expect(handler.onConnectionChange).not.toHaveBeenCalled();
      expect(handler.onEvent).not.toHaveBeenCalled();
    });

    test('does not retry a previous session action in a new session', () => {
      const { c, sockets } = setup();
      c.sendEvent({ type: 'ACTION', name: 'NAVIGATE', args: '{}' }, 0);
      c.connect('second', 'other-secret');
      sockets[1].onopen();
      jest.advanceTimersByTime(2200);
      expect(sockets[1].send).not.toHaveBeenCalled();
      expect(c.getMaxBufferID()).toBeNull();
    });

    test('preserves pending actions when reconnecting to the same session', () => {
      const { c, sockets } = setup();
      c.sendEvent({ type: 'ACTION', name: 'NAVIGATE', args: '{}' }, 0);
      c.connect('first', 'secret');
      sockets[1].onopen();
      jest.advanceTimersByTime(2200);
      expect(sockets[1].send).toHaveBeenCalledWith(
        sockets[0].send.mock.calls[0][0],
      );
    });

    test('ignores callbacks from a replaced socket after the new socket opens', () => {
      const { c, handler, sockets } = setup();
      c.connect('first', 'secret');
      sockets[1].onopen();
      handler.onConnectionChange.mockClear();
      sockets[0].onclose(new CloseEvent('close', { code: 1000 }));
      sockets[0].onopen();
      sockets[0].onmessage(
        new MessageEvent('message', {
          data: JSON.stringify({
            client: 'peer',
            instance: 'peer-instance',
            id: null,
            event: { type: 'STATUS', connected: false },
          }),
        }),
      );
      expect(c.isConnected()).toBe(true);
      expect(handler.onConnectionChange).not.toHaveBeenCalled();
      expect(handler.onEvent).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1000);
      expect(sockets).toHaveLength(2);
    });
  });

  beforeEach(() => {
    serverSockets.length = 0;
    serverMessages.length = 0;
  });

  describe('reconnection behavior', () => {
    function connected() {
      const handler = {
        onConnectionChange: jest.fn(),
        onReject: jest.fn(),
        onEvent: jest.fn(),
      };
      const c = new Connection(() => Promise.resolve(true));
      c.registerHandler(handler);
      c.configure('testid', 'testinstance');
      c.connect('testsession', 'scrt');
      flush();
      expect(c.isConnected()).toEqual(true);
      expect(serverSockets.length).toEqual(1);
      return { c, handler };
    }

    // Drop the socket from the server side, the way a real network blip does.
    function dropFromServer() {
      serverSockets[serverSockets.length - 1].close({
        code: 1006,
        reason: 'network blip',
        wasClean: false,
      });
      flush();
    }

    test('can still send events after a dropped socket reconnects', async () => {
      const { c } = connected();

      dropFromServer();
      expect(serverSockets.length).toEqual(2);

      // The periodic online check must not conclude the link is dead just
      // because we reconnected: it used to see an emptied sessionID and latch
      // connected = false, which makes sendEvent() a silent no-op forever.
      await c.checkOnlineState();
      expect(c.isConnected()).toEqual(true);

      serverMessages.length = 0;
      c.sendEvent({ type: 'INTERACTION', id: 'x', event: 'touchstart' }, 0);
      flush();
      expect(serverMessages.length).toEqual(1);
      expect(JSON.parse(serverMessages[0]).event).toEqual({
        type: 'INTERACTION',
        id: 'x',
        event: 'touchstart',
      });
    });

    test('keeps the session ID and secret across repeated reconnects', () => {
      const { c } = connected();

      dropFromServer();
      dropFromServer();

      // Every reconnect must target the same session URL. Losing the
      // credentials produced `/session/?client=..&secret=`, which the mock
      // server does not serve at all.
      expect(serverSockets.length).toEqual(3);
      for (const socket of serverSockets) {
        expect(socket.url).toEqual(testURL);
      }
      expect(c.isConnected()).toEqual(true);
    });

    test('is triggered on connection failure', () => {
      const { c, handler } = connected();
      handler.onConnectionChange.mockClear();
      dropFromServer();
      expect(handler.onConnectionChange.mock.calls).toEqual([[false], [true]]);
      expect(c.isConnected()).toBe(true);
    });
    test('backs off with random exponential offset', () => {
      const { c } = connected();
      jest.spyOn(Math, 'random').mockReturnValue(0.999);
      const timeout = jest.spyOn(global, 'setTimeout');
      for (const delay of [210, 220, 240, 280]) {
        c.reconnect();
        expect(timeout).toHaveBeenLastCalledWith(expect.any(Function), delay);
        flush();
      }
    });
    test('allows the reconnect handler to publish client status immediately', () => {
      const { c, handler } = connected();
      handler.onConnectionChange.mockImplementation(online => {
        if (online) {
          c.sendEvent({ type: 'STATUS', connected: true }, 0);
        }
      });
      dropFromServer();
      expect(
        serverMessages.map(message => JSON.parse(message).event),
      ).toContainEqual({
        type: 'STATUS',
        connected: true,
      });
    });
    test('delivers missed state returned after reconnect to the event handler', () => {
      const { handler } = connected();
      dropFromServer();
      const event = {
        id: null,
        client: 'server',
        instance: 'server',
        event: {
          type: 'MULTI_EVENT',
          lastId: 1,
          events: [
            JSON.stringify({
              id: 1,
              event: {
                type: 'ACTION',
                name: 'next',
                args: '{}',
              },
            }),
          ],
        },
      };
      serverSockets[1].send(JSON.stringify(event));
      flush();
      expect(handler.onEvent).toHaveBeenCalledWith(event, false);
    });

    test('cancels a scheduled reconnect when leaving multiplayer', () => {
      const { c } = connected();
      c.reconnect();
      c.disconnect();
      flush();
      expect(serverSockets).toHaveLength(1);
      expect(c.isConnected()).toBe(false);
    });
  });

  describe('connection behavior', () => {
    function setup() {
      const handler = {
        onConnectionChange: jest.fn(),
        onReject: jest.fn(),
        onEvent: jest.fn(),
        connected: true, // Edit this to change connection state
      };
      const c = new Connection(() => Promise.resolve(handler.connected));
      c.registerHandler(handler);
      c.configure('testid', 'testinstance');
      c.connect('testsession', 'scrt');
      flush();
      return { c, handler };
    }

    test('triggers onConnectionChange when connecting for the first time', done => {
      const { c, handler } = setup();
      c.checkOnlineState()
        .then(() => {
          expect(handler.onConnectionChange).toHaveBeenCalledWith(true);
          done();
        })
        .catch(done);
    });
    test('triggers onConnectionChange when disconnected', done => {
      const { c, handler } = setup();
      c.checkOnlineState()
        .then(() => {
          handler.onConnectionChange.mockClear();
          handler.connected = false;
          return c.checkOnlineState();
        })
        .then(() => {
          expect(handler.onConnectionChange).toHaveBeenCalledWith(false);
          done();
        })
        .catch(done);
    });
    test('triggers onConnectionChange when reconnected', done => {
      const { c, handler } = setup();
      c.checkOnlineState()
        .then(() => {
          handler.connected = false;
          return c.checkOnlineState();
        })
        .then(() => {
          handler.onConnectionChange.mockClear();
          handler.connected = true;
          return c.checkOnlineState();
        })
        .then(() => {
          expect(handler.onConnectionChange).toHaveBeenCalledWith(true);
          done();
        })
        .catch(done);
    });
  });
});

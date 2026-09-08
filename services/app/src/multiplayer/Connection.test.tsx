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

    test.skip('is triggered on connection failure', () => {
      /* TODO */
    });
    test.skip('backs off with random exponential offset', () => {
      /* TODO */
    });
    test.skip('publishes client status when reconnected', () => {
      /* TODO */
    });
    test.skip('requests missed state and dispatches fast-forward actions', () => {
      /* TODO */
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

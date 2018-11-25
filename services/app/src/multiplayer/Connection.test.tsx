import {Connection} from './Connection';
import { Server } from 'mock-socket';

jest.useFakeTimers();

const testURL = 'ws://betaapi.expeditiongame.com/ws/multiplayer/v1/session/testsession?client=testid&instance=testinstance&secret=scrt';

const mockServer = new Server(testURL);
mockServer.on('connection', socket => {
  socket.on('message', data => {
    console.log(data);
  });
});

describe('Connection', () => {
  describe('reconnection behavior', () => {
    test.skip('is triggered on connection failure', () => { /* TODO */ });
    test.skip('backs off with random exponential offset', () => { /* TODO */ });
    test.skip('publishes client status when reconnected', () => { /* TODO */ });
    test.skip('requests missed state and dispatches fast-forward actions', () => { /* TODO */ });
  });

  describe('connection behavior', () => {
    function setup() {
      const handler = {
        onConnectionChange: jasmine.createSpy('onConnectionChange'),
        onReject: jasmine.createSpy('onReject'),
        onEvent: jasmine.createSpy('onEvent'),
        connected: true, // Edit this to change connection state
      };
      const c = new Connection(() => handler.connected);
      c.registerHandler(handler);
      c.configure('testid', 'testinstance');
      c.connect('testsession', 'scrt');
      return {c, handler};
    }

    test('triggers onConnectionChange when connecting for the first time', () => {
      const {c, handler} = setup();
      jest.runOnlyPendingTimers();
      expect(handler.onConnectionChange).toHaveBeenCalledWith(true);
    });
    test('triggers onConnectionChange when disconnected', () => {
      const {c, handler} = setup();
      jest.runOnlyPendingTimers(); // Initial connection
      handler.onConnectionChange.calls.reset();
      handler.connected = false;
      jest.runOnlyPendingTimers();
      expect(handler.onConnectionChange).toHaveBeenCalledWith(false);
    });
    test('triggers onConnectionChange when reconnected', () => {
      const {c, handler} = setup();
      jest.runOnlyPendingTimers(); // Initial connection
      handler.connected = false;
      jest.runOnlyPendingTimers();
      handler.onConnectionChange.calls.reset();
      handler.connected = true;
      jest.runOnlyPendingTimers();
      expect(handler.onConnectionChange).toHaveBeenCalledWith(true);
    });
  });
});

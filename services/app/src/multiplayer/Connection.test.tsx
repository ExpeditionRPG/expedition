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
      const c = new Connection(() => Promise.resolve(handler.connected));
      c.registerHandler(handler);
      c.configure('testid', 'testinstance');
      c.connect('testsession', 'scrt');
      return {c, handler};
    }

    test('triggers onConnectionChange when connecting for the first time', (done) => {
      const {c, handler} = setup();
      c.checkOnlineState().then(() => {
        expect(handler.onConnectionChange).toHaveBeenCalledWith(true);
        done();
      }).catch(done.fail);

    });
    test('triggers onConnectionChange when disconnected', (done) => {
      const {c, handler} = setup();
      c.checkOnlineState().then(() => {
        handler.onConnectionChange.calls.reset();
        handler.connected = false;
        return c.checkOnlineState();
      }).then(() => {
        expect(handler.onConnectionChange).toHaveBeenCalledWith(false);
        done();
      }).catch(done.fail);
    });
    test('triggers onConnectionChange when reconnected', (done) => {
      const {c, handler} = setup();
      c.checkOnlineState().then(() => {
        handler.connected = false;
        return c.checkOnlineState();
      }).then(() => {
        handler.onConnectionChange.calls.reset();
        handler.connected = true;
        return c.checkOnlineState();
      }).then(() => {
        expect(handler.onConnectionChange).toHaveBeenCalledWith(true);
        done();
      }).catch(done.fail);
    });
  });

  describe('sendEvent', () => {
    test.skip('sends event', () => {/* TODO */});
  });
});

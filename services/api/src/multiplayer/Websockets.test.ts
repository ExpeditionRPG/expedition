import { initSessionClient, resetSessions } from './Sessions';
import { newMockWebsocket } from './TestData';
import { broadcast, broadcastError } from './Websockets';

describe('Websockets', () => {
  afterEach(resetSessions);

  describe('setupWebsockets', () => {
    test.skip('Sets up websocket handler on new connection', () => {
      /* TODO */
    });
  });

  describe('broadcast', () => {
    test('sends to all connected peers within a session', () => {
      const ws1 = newMockWebsocket();
      initSessionClient(123, 'abc', 'def', ws1);
      const ws2 = newMockWebsocket();
      initSessionClient(123, 'zxc', 'vbn', ws2);
      broadcast(123, 'testing');
      for (const ws of [ws1, ws2]) {
        expect(ws.send).toHaveBeenCalledWith('testing', expect.any(Function));
      }
    });
  });

  describe('broadcastError', () => {
    test('sends to all connected peers within a session', () => {
      const ws1 = newMockWebsocket();
      initSessionClient(123, 'abc', 'def', ws1);
      const ws2 = newMockWebsocket();
      initSessionClient(123, 'zxc', 'vbn', ws2);
      broadcastError(123, new Error('test error'));
      for (const ws of [ws1, ws2]) {
        expect(ws.send.mock.lastCall[0]).toContain('test error');
      }
    });
  });
});

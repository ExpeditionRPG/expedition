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
      initSessionClient(123, 'abc', 'def', ws1 as any);
      const ws2 = newMockWebsocket();
      initSessionClient(123, 'zxc', 'vbn', ws2 as any);
      broadcast(123, 'testing');
      for (const ws of [ws1, ws2]) {
        expect(ws.send).toHaveBeenCalledWith('testing', jasmine.any(Function));
      }
    });
  });

  describe('broadcastError', () => {
    test('sends to all connected peers within a session', () => {
      const ws1 = newMockWebsocket();
      initSessionClient(123, 'abc', 'def', ws1 as any);
      const ws2 = newMockWebsocket();
      initSessionClient(123, 'zxc', 'vbn', ws2 as any);
      broadcastError(123, new Error('test error'));
      for (const ws of [ws1, ws2]) {
        expect((ws.send as any).calls.mostRecent().args[0]).toContain(
          'test error',
        );
      }
    });
  });
});

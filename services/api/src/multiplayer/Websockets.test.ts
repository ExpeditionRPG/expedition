import * as http from 'http';
import * as WebSocket from 'ws';
import { Session } from 'shared/schema/multiplayer/Sessions';
import { SessionClient } from 'shared/schema/multiplayer/SessionClients';
import { testingDBWithState } from '../models/TestData';
import { initSessionClient, resetSessions } from './Sessions';
import { newMockWebsocket } from './TestData';
import { broadcast, broadcastError, setupWebsockets } from './Websockets';

describe('Websockets', () => {
  afterEach(resetSessions);

  describe('setupWebsockets', () => {
    test('sets up real websocket clients, broadcasts text, and replays committed actions after reconnect', async () => {
      const db = await testingDBWithState([
        new Session({
          id: 42,
          secret: 'secret',
          eventCounter: 0,
          locked: false,
        }),
        new SessionClient({ session: 42, client: 'alice', secret: 'secret' }),
        new SessionClient({ session: 42, client: 'bob', secret: 'secret' }),
      ]);
      const server = http.createServer();
      const wss = setupWebsockets(db, server);
      const clients: WebSocket[] = [];
      const messages = new Map<WebSocket, any[]>();
      await new Promise<void>(resolve =>
        server.listen(0, '127.0.0.1', resolve),
      );
      const port = (server.address() as any).port;
      async function open(client: string) {
        const ws = new WebSocket(
          'ws://127.0.0.1:' +
            port +
            '/ws/multiplayer/v1/session/42?client=' +
            client +
            '&instance=tab&secret=secret',
        );
        clients.push(ws);
        messages.set(ws, []);
        ws.on('message', data =>
          messages.get(ws)!.push(JSON.parse(data.toString())),
        );
        await new Promise<void>((resolve, reject) => {
          ws.once('open', resolve);
          ws.once('error', reject);
        });
        return ws;
      }
      async function receive(ws: WebSocket, predicate: (m: any) => boolean) {
        for (let i = 0; i < 100; i++) {
          const found = messages.get(ws)!.find(predicate);
          if (found) {
            return found;
          }
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        throw new Error(
          'Timed out waiting for websocket message: ' +
            JSON.stringify(messages.get(ws)),
        );
      }
      try {
        const alice = await open('alice');
        const bob = await open('bob');
        const action = {
          client: 'alice',
          instance: 'tab',
          id: 1,
          event: { type: 'ACTION', name: 'navigate', args: '{}' },
        };
        alice.send(JSON.stringify(action));
        expect(await receive(bob, m => m.id === 1)).toEqual(action);
        expect(await receive(alice, m => m.id === 1)).toEqual(action);
        const replacement = await open('bob');
        await new Promise<void>(resolve => {
          bob.once('close', () => resolve());
          bob.close();
        });
        replacement.send(
          JSON.stringify({
            client: 'bob',
            instance: 'tab',
            id: null,
            event: { type: 'STATUS', connected: true, lastEventID: 0 },
          }),
        );
        const replay = await receive(
          replacement,
          m => m.event.type === 'MULTI_EVENT',
        );
        expect(replay.event.lastId).toBe(1);
        expect(replay.event.events.map((e: string) => JSON.parse(e))).toEqual([
          action,
        ]);
        expect(
          await receive(
            alice,
            m => m.client === 'bob' && m.event.connected === true,
          ),
        ).toBeDefined();
        replacement.send(Buffer.from([0, 1, 2]));
        expect(
          (await receive(replacement, m => m.event.type === 'ERROR')).event
            .error,
        ).toContain('binary');
      } finally {
        for (const client of clients) {
          client.terminate();
        }
        for (const client of wss.clients) {
          client.terminate();
        }
        await new Promise<void>(resolve => wss.close(() => resolve()));
        await new Promise<void>(resolve => server.close(() => resolve()));
        await db.sequelize.close();
      }
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

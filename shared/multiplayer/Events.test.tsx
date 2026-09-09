import {
  ActionEvent,
  MultiEvent,
  MultiplayerEvent,
  StatusEvent,
} from './Events';
import { toClientKey } from './Session';
describe('multiplayer wire contracts', () => {
  test('keeps device identity separate when one authenticated user publishes two statuses', () => {
    const status: StatusEvent = {
      type: 'STATUS',
      connected: true,
      lastEventID: 4,
      waitingOn: { type: 'TIMER', elapsedMillis: 1200 },
    };
    const messages: MultiplayerEvent[] = ['phone', 'tablet'].map(instance => ({
      client: 'alice',
      instance,
      id: null,
      event: status,
    }));
    const received: MultiplayerEvent[] = JSON.parse(JSON.stringify(messages));
    const peers = Object.fromEntries(
      received.map(message => [
        toClientKey(message.client, message.instance),
        message.event,
      ]),
    );
    expect(Object.keys(peers)).toEqual(['alice|phone', 'alice|tablet']);
    expect(peers['alice|phone']).toEqual(status);
  });
  test('replay envelopes preserve serialized action arguments and authoritative event IDs', () => {
    const action: ActionEvent = {
      type: 'ACTION',
      name: 'navigate',
      args: JSON.stringify({ title: 'A "quoted" choice', count: 2 }),
    };
    const event: MultiplayerEvent = {
      client: 'alice',
      instance: 'phone',
      id: 5,
      event: action,
    };
    const replay: MultiEvent = {
      type: 'MULTI_EVENT',
      events: [JSON.stringify(event)],
      lastId: 5,
    };
    const decoded: MultiplayerEvent = JSON.parse(replay.events[0]);
    expect(decoded.id).toBe(replay.lastId);
    expect(decoded.event.type).toBe('ACTION');
    expect(JSON.parse((decoded.event as ActionEvent).args)).toEqual({
      title: 'A "quoted" choice',
      count: 2,
    });
  });
});

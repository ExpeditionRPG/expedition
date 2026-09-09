import { EventEmitter } from 'events';
import Config from '../config';
import { chaosDB, chaosWS, maybeChaosDB, maybeChaosWS } from './Chaos';

function socket() {
  const ws: any = new EventEmitter();
  ws.readyState = 1;
  ws.send = jest.fn();
  ws.close = jest.fn();
  return ws;
}
function configure(flags: string[], fraction = 1, env = 'test') {
  jest
    .spyOn(Config, 'get')
    .mockImplementation(
      (key: string) =>
        ({ CHAOS: flags, CHAOS_FRACTION: fraction, NODE_ENV: env })[key],
    );
}
describe('Chaos', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });
  test('stays off when disabled or in production', () => {
    configure(['CHAOS_DROP_MESSAGE'], 1, 'production');
    const ws = socket();
    const db: any = {};
    expect(maybeChaosWS(ws)).toBe(ws);
    expect(maybeChaosDB(db, 1, ws)).toBe(db);
    expect(jest.getTimerCount()).toBe(0);
    ws.send('hello');
    expect(ws.send).toHaveBeenCalledWith('hello');
  });
  test('randomly closes sockets, forcing clients to reverify membership on reconnect', () => {
    configure(['CHAOS_CLOSE_SOCKET']);
    jest.spyOn(Math, 'random').mockReturnValue(0.01);
    const ws = socket();
    chaosWS(ws);
    jest.advanceTimersByTime(2000);
    expect(ws.close).toHaveBeenCalledTimes(1);
  });
  test('randomly injects competing events to produce conflicting upserts', async () => {
    configure(['CHAOS_INJECT_DB']);
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const update = jest.fn().mockResolvedValue(true);
    const upsert = jest.fn().mockResolvedValue(true);
    const db: any = {
      sequelize: { transaction: (fn: any) => fn({}) },
      sessions: {
        findOne: jest.fn().mockResolvedValue({ get: () => 3, update }),
      },
      events: {
        findOne: jest
          .fn()
          .mockResolvedValueOnce({ get: () => 3 })
          .mockResolvedValue(null),
        upsert,
      },
    };
    const ws = socket();
    chaosDB(db, 42, ws);
    jest.advanceTimersByTime(2000);
    for (let i = 0; i < 15; i++) {
      await Promise.resolve();
    }
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: 4, client: 'chaos', session: 42 }),
      expect.anything(),
    );
  });
  test('randomly replays messages to the client', () => {
    configure(['CHAOS_REPLAY']);
    jest.spyOn(Math, 'random').mockReturnValue(0.8);
    const ws = socket();
    const send = ws.send;
    chaosWS(ws);
    ws.send('original');
    jest.advanceTimersByTime(2000);
    expect(send.mock.calls.map((c: any[]) => c[0])).toEqual([
      'original',
      'original',
    ]);
  });
  test('randomly fuzzes messages through the ws 8 message event', () => {
    configure(['CHAOS_FUZZ_SOCKET']);
    jest.spyOn(Math, 'random').mockReturnValue(0.2);
    const ws = socket();
    const listener = jest.fn();
    ws.on('message', listener);
    chaosWS(ws);
    jest.advanceTimersByTime(2000);
    expect(listener).toHaveBeenCalledWith(expect.any(Buffer), false);
    expect(listener.mock.calls[0][0].length).toBeGreaterThan(0);
  });
  test('randomly delays outbound messages', () => {
    configure(['CHAOS_DELAY_MESSAGE']);
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const ws = socket();
    const send = ws.send;
    chaosWS(ws);
    const cb = jest.fn();
    ws.send('delayed', cb);
    expect(send).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(send).toHaveBeenCalledWith('delayed', cb);
  });
  test('randomly drops outbound messages', () => {
    configure(['CHAOS_DROP_MESSAGE']);
    jest.spyOn(Math, 'random').mockReturnValue(0.2);
    const ws = socket();
    const send = ws.send;
    chaosWS(ws);
    ws.send('dropped');
    expect(send).not.toHaveBeenCalled();
  });
  test('forwards unselected messages and preserves callbacks', () => {
    configure(['CHAOS_DROP_MESSAGE'], 0.1);
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const ws = socket();
    const send = ws.send;
    const cb = jest.fn();
    chaosWS(ws);
    ws.send('normal', cb);
    expect(send).toHaveBeenCalledWith('normal', cb);
  });
  test('forwards selected messages when no drop or delay occurs', () => {
    configure(['CHAOS_DROP_MESSAGE']);
    jest.spyOn(Math, 'random').mockReturnValue(0.8);
    const ws = socket();
    const send = ws.send;
    chaosWS(ws);
    ws.send('normal');
    expect(send).toHaveBeenCalledWith('normal', undefined);
  });
  test('stops chaos timers after socket closure', () => {
    configure([]);
    const ws = socket();
    chaosWS(ws);
    chaosDB({} as any, 1, ws);
    ws.readyState = 3;
    jest.advanceTimersByTime(2000);
    expect(jest.getTimerCount()).toBe(0);
  });
});

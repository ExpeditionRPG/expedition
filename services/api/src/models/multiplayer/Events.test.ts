import { Event } from 'shared/schema/multiplayer/Events';
import { Session } from 'shared/schema/multiplayer/Sessions';
import { initSessionClient, resetSessions } from '../../multiplayer/Sessions';
import { newMockWebsocket } from '../../multiplayer/TestData';
import { Database, EventInstance, SessionInstance } from '../Database';
import {
  events as e,
  sessions as s,
  TEST_NOW,
  testingDBWithState,
} from '../TestData';
import {
  commitAndBroadcastAction,
  commitEvent,
  commitEventWithoutID,
  getLargestEventID,
  getLastEvent,
  getOrderedEventsAfter,
} from './Events';

function ts(time: number): Date {
  return new Date(TEST_NOW.getTime() + time * 1000);
}

describe('events', () => {
  describe('getLastEvent', () => {
    test('gets the most recent event in the session', (done: DoneFn) => {
      testingDBWithState([
        new Event({ ...e.basic, timestamp: ts(0), id: 1 }),
        new Event({ ...e.basic, timestamp: ts(1), id: 2 }),
        new Event({ ...e.basic, timestamp: ts(2), id: 3 }),
      ])
        .then(db => getLastEvent(db, e.basic.session))
        .then((i: EventInstance) => {
          expect(new Event(i.dataValues).id).toEqual(3);
          done();
        })
        .catch(done);
    });
  });

  describe('getOrderedEventsAfter', () => {
    test('gets an ordered list of events after the start time', (done: DoneFn) => {
      testingDBWithState([
        new Event({ ...e.basic, timestamp: ts(0), id: 1 }),
        new Event({ ...e.basic, timestamp: ts(1), id: 2 }),
        new Event({ ...e.basic, timestamp: ts(2), id: 3 }),
        new Event({ ...e.basic, timestamp: ts(3), id: 4 }),
      ])
        .then(db => getOrderedEventsAfter(db, e.basic.session, 2))
        .then((results: EventInstance[]) => {
          expect(results.length).toEqual(2);
          // Ascending order of time
          expect(new Event(results[0].dataValues).id).toEqual(3);
          expect(new Event(results[1].dataValues).id).toEqual(4);
          done();
        })
        .catch(done);
    });
  });

  describe('commitEvent', () => {
    test('rejects events with a most recent ID but not matching JSON', (done: DoneFn) => {
      testingDBWithState([
        new Session({ ...s.basic, id: e.basic.session, eventCounter: 3 }),
        new Event({
          ...e.basic,
          timestamp: ts(0),
          id: 3,
          json: 'OLD_EVENT_DIFFERENT_JSON',
        }),
      ])
        .then(db =>
          commitEvent(
            db,
            e.basic.session,
            e.basic.client,
            e.basic.instance,
            3,
            e.basic.type,
            e.basic.json,
          ),
        )
        .then(() => done(new Error('expected error')))
        .catch((err: Error) => {
          expect(err.toString()).toContain('mismatch');
          done();
        });
    });
    test('rejects events with a too-large ID', (done: DoneFn) => {
      testingDBWithState([
        new Session({ ...s.basic, id: e.basic.session, eventCounter: 3 }),
        new Event({ ...e.basic, timestamp: ts(0), id: 3 }),
      ])
        .then(db =>
          commitEvent(
            db,
            e.basic.session,
            e.basic.client,
            e.basic.instance,
            5,
            e.basic.type,
            e.basic.json,
          ),
        )
        .then(() => done(new Error('expected error')))
        .catch((err: Error) => {
          expect(err.toString()).toContain('mismatch');
          done();
        });
    });
    test('lazily accepts events that have already happened', (done: DoneFn) => {
      testingDBWithState([
        new Session({ ...s.basic, id: e.basic.session, eventCounter: 3 }),
        new Event({ ...e.basic, timestamp: ts(0), id: 3 }), // Matches this one
        new Event({ ...e.basic, timestamp: ts(1), id: 4 }),
      ])
        .then(db =>
          commitEvent(
            db,
            e.basic.session,
            e.basic.client,
            e.basic.instance,
            3,
            e.basic.type,
            e.basic.json,
          ),
        )
        .then((result: number | null) => {
          expect(result).toEqual(null);
          done();
        })
        .catch(done);
    });
    test('rejects events that do not belong to a known session', (done: DoneFn) => {
      testingDBWithState([])
        .then(db =>
          commitEvent(
            db,
            e.basic.session,
            e.basic.client,
            e.basic.instance,
            3,
            e.basic.type,
            e.basic.json,
          ),
        )
        .then(() => done(new Error('expected session not found')))
        .catch((err: Error) => {
          expect(err.toString()).toContain('could not find session');
          done();
        });
    });
    test('accepts events with the correct next id', (done: DoneFn) => {
      let db: Database;
      const n = 3;
      testingDBWithState([
        new Session({ ...s.basic, id: e.basic.session, eventCounter: n }),
        new Event({ ...e.basic, timestamp: ts(0), id: n }),
      ])
        .then(tdb => {
          db = tdb;
          return commitEvent(
            db,
            e.basic.session,
            e.basic.client,
            e.basic.instance,
            n + 1,
            e.basic.type,
            e.basic.json,
          );
        })
        .then((result: number | null) => {
          expect(result).toEqual(n + 1);
          return db.events.findOne({ where: { id: n + 1 } });
        })
        .then((i: EventInstance) => {
          // Event is inserted
          expect(new Event(i.dataValues).id).toEqual(n + 1);
          return db.sessions.findOne({ where: { id: e.basic.session } });
        })
        .then((i: SessionInstance) => {
          // Event counter is updated
          expect(new Session(i.dataValues).eventCounter).toEqual(n + 1);
          done();
        })
        .catch(done);
    });
  });

  describe('getLargestEventID', () => {
    test('gets the max event ID for the session', (done: DoneFn) => {
      testingDBWithState([
        new Event({ ...e.basic, timestamp: ts(0), id: 1 }),
        new Event({ ...e.basic, timestamp: ts(1), id: 2 }),
        new Event({ ...e.basic, timestamp: ts(2), id: 3 }),
        new Event({ ...e.basic, timestamp: ts(3), id: 4 }),
      ])
        .then(db => getLargestEventID(db, e.basic.session))
        .then((result: number) => {
          expect(result).toEqual(4);
          done();
        })
        .catch(done);
    });

    test('returns 0 if no event in session', (done: DoneFn) => {
      testingDBWithState([])
        .then(db => getLargestEventID(db, e.basic.session))
        .then((result: number) => {
          expect(result).toEqual(0);
          done();
        })
        .catch(done);
    });
  });

  describe('commitEventWithoutID', () => {
    test('inserts an event with an automatically-determined ID', (done: DoneFn) => {
      let db: Database;
      const n = 3;
      testingDBWithState([
        new Session({ ...s.basic, id: e.basic.session, eventCounter: n }),
        new Event({
          ...e.basic,
          timestamp: ts(0),
          id: n,
          json: 'OLD_EVENT_DIFFERENT_JSON',
        }),
      ])
        .then(tdb => {
          db = tdb;
          return commitEventWithoutID(
            db,
            e.basic.session,
            e.basic.client,
            e.basic.instance,
            e.basic.type,
            JSON.parse(e.basic.json),
          );
        })
        .then((result: number | null) => {
          expect(result).toEqual(n + 1);
          return db.events.findOne({ where: { id: n + 1 } });
        })
        .then((i: EventInstance) => {
          // Event is inserted; ID is applied to event JSON
          const result = new Event(i.dataValues);
          expect(result.id).toEqual(n + 1);
          expect(JSON.parse(result.json).id).toEqual(n + 1);
          return db.sessions.findOne({ where: { id: e.basic.session } });
        })
        .then((i: SessionInstance) => {
          // Event counter is updated
          expect(new Session(i.dataValues).eventCounter).toEqual(n + 1);
          done();
        })
        .catch(done);
    });
    test('lazily accepts if it matches the most recent event', (done: DoneFn) => {
      testingDBWithState([
        new Session({ ...s.basic, id: e.basic.session, eventCounter: 4 }),
        new Event({ ...e.basic, timestamp: ts(0), id: 3 }), // Matches this one
        new Event({ ...e.basic, timestamp: ts(1), id: 4 }),
      ])
        .then(db =>
          commitEventWithoutID(
            db,
            e.basic.session,
            e.basic.client,
            e.basic.instance,
            e.basic.type,
            JSON.parse(e.basic.json),
          ),
        )
        .then((result: number | null) => {
          expect(result).toEqual(4);
          done();
        })
        .catch(done);
    });
    test('rejects events that do not belong to a known session', (done: DoneFn) => {
      testingDBWithState([])
        .then(db =>
          commitEventWithoutID(
            db,
            e.basic.session,
            e.basic.client,
            e.basic.instance,
            e.basic.type,
            JSON.parse(e.basic.json),
          ),
        )
        .then(() => done(new Error('expected session not found')))
        .catch((err: Error) => {
          expect(err.toString()).toContain('could not find session');
          done();
        });
    });
  });

  describe('commitAndBroadcastAction', () => {
    afterEach(resetSessions);

    test('commits the action, then broadcasts it', done => {
      const ws1 = newMockWebsocket();
      initSessionClient(e.basic.session, e.basic.client, e.basic.instance, ws1);

      let db: Database;
      const n = 3;
      testingDBWithState([
        new Session({ ...s.basic, id: e.basic.session, eventCounter: n }),
        new Event({
          ...e.basic,
          timestamp: ts(0),
          id: n,
          json: 'OLD_EVENT_DIFFERENT_JSON',
        }),
      ])
        .then(tdb => {
          db = tdb;
          return commitAndBroadcastAction(
            db,
            e.basic.session,
            e.basic.client,
            e.basic.instance,
            { type: 'ACTION', name: 'testFn', args: 'testargs' },
          );
        })
        .then(() => {
          return db.events.findOne({ where: { id: n + 1 } });
        })
        .then((i: EventInstance) => {
          const result = new Event(i.dataValues);
          expect(result.json).toContain('testFn');
          expect(ws1.send).toHaveBeenCalled();
          expect(ws1.send.mock.lastCall[0]).toContain('testFn');
          done();
        })
        .catch(done);
    });
  });
});

describe('event ordering and transaction isolation regressions', () => {
  test('replays authoritative IDs in order even when server clocks move backwards', async () => {
    const db = await testingDBWithState([
      new Event({ ...e.basic, id: 1, timestamp: ts(3) }),
      new Event({ ...e.basic, id: 2, timestamp: ts(2) }),
      new Event({ ...e.basic, id: 3, timestamp: ts(1) }),
    ]);
    expect(await getLargestEventID(db, e.basic.session)).toBe(3);
    expect(
      (await getOrderedEventsAfter(db, e.basic.session, 0)).map(row =>
        row.get('id'),
      ),
    ).toEqual([1, 2, 3]);
    await db.sequelize.close();
  });
  test('locks the shared session counter and reads the contested event in the same transaction', async () => {
    const db = await testingDBWithState([
      new Session({ ...s.basic, id: e.basic.session, eventCounter: 0 }),
    ]);
    const sessionRead = jest.spyOn(db.sessions, 'findOne');
    const eventRead = jest.spyOn(db.events, 'findOne');
    await commitEvent(
      db,
      e.basic.session,
      'alice',
      'tab',
      1,
      'ACTION',
      '{"winner":true}',
    );
    const options = sessionRead.mock.calls[0][0]!;
    expect(options.lock).toBe('UPDATE');
    expect(options.transaction).toBeDefined();
    expect(eventRead.mock.calls[0][0]!.transaction).toBe(options.transaction);
    await expect(
      commitEvent(
        db,
        e.basic.session,
        'bob',
        'tab',
        1,
        'ACTION',
        '{"loser":true}',
      ),
    ).rejects.toThrow('mismatch');
    expect((await db.events.findOne())!.get('json')).toBe('{"winner":true}');
    await db.sequelize.close();
  });
});

test('retrying an assigned server action stays idempotent after intervening commits', async () => {
  const db = await testingDBWithState([
    new Session({ ...s.basic, id: e.basic.session, eventCounter: 0 }),
  ]);
  const first = {
    id: null,
    event: { type: 'ACTION', name: 'advance', args: '{}' },
  };
  const second = {
    id: null,
    event: { type: 'ACTION', name: 'advance', args: '{}' },
  };
  const commit = (struct: object) =>
    commitEventWithoutID(
      db,
      e.basic.session,
      'SERVER',
      'instance',
      'ACTION',
      struct,
    );
  expect(await commit(first)).toBe(1);
  // A fresh id:null is a distinct intentional action, even with the same body.
  expect(await commit(second)).toBe(2);
  expect(await commit(first)).toBe(1);
  expect(first.id).toBe(1);
  expect(await db.events.count()).toBe(2);
  expect(
    (await db.sessions.findByPk(e.basic.session))!.get('eventCounter'),
  ).toBe(2);
  expect(
    JSON.parse(
      (await db.events.findOne({
        where: { session: e.basic.session, id: 1 },
      }))!.get('json'),
    ),
  ).toEqual(first);
  await db.sequelize.close();
});

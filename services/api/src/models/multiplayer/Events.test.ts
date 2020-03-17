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

interface DoneFn {
  (): void;
  fail: (error: Error) => void;
}

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
          expect(new Event(i.get()).id).toEqual(3);
          done();
        })
        .catch(done.fail);
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
          expect(new Event(results[0].get()).id).toEqual(3);
          expect(new Event(results[1].get()).id).toEqual(4);
          done();
        })
        .catch(done.fail);
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
        .then(() => done.fail(Error('expected error')))
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
        .then(() => done.fail(Error('expected error')))
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
        .catch(done.fail);
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
        .then(() => done.fail(Error('expected session not found')))
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
          expect(new Event(i.get()).id).toEqual(n + 1);
          return db.sessions.findOne({ where: { id: e.basic.session } });
        })
        .then((i: SessionInstance) => {
          // Event counter is updated
          expect(new Session(i.get()).eventCounter).toEqual(n + 1);
          done();
        })
        .catch(done.fail);
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
        .catch(done.fail);
    });

    test('returns 0 if no event in session', (done: DoneFn) => {
      testingDBWithState([])
        .then(db => getLargestEventID(db, e.basic.session))
        .then((result: number) => {
          expect(result).toEqual(0);
          done();
        })
        .catch(done.fail);
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
          const result = new Event(i.get());
          expect(result.id).toEqual(n + 1);
          expect(JSON.parse(result.json).id).toEqual(n + 1);
          return db.sessions.findOne({ where: { id: e.basic.session } });
        })
        .then((i: SessionInstance) => {
          // Event counter is updated
          expect(new Session(i.get()).eventCounter).toEqual(n + 1);
          done();
        })
        .catch(done.fail);
    });
    test('lazily accepts if it matches the most recent event', (done: DoneFn) => {
      // TODO: This doesn't prevent multiple commits if something sneaks in between retries
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
        .catch(done.fail);
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
        .then(() => done.fail(Error('expected session not found')))
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
      initSessionClient(
        e.basic.session,
        e.basic.client,
        e.basic.instance,
        ws1 as any,
      );

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
          const result = new Event(i.get());
          expect(result.json).toContain('testFn');
          expect(ws1.send).toHaveBeenCalled();
          expect((ws1 as any).send.calls.mostRecent().args[0]).toContain(
            'testFn',
          );
          done();
        })
        .catch(done.fail);
    });
  });
});

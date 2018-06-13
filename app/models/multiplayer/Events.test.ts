import {Database, EventInstance, SessionInstance} from '../Database'
import {Event} from 'expedition-qdl/lib/schema/multiplayer/Events'
import {Session} from 'expedition-qdl/lib/schema/multiplayer/Sessions'
import {
  getLastEvent,
  getOrderedEventsAfter,
  commitEvent,
  commitEventWithoutID,
  getLargestEventID,
} from './Events'
import {
  testingDBWithState,
  sessions as s,
  events as e,
  TEST_NOW,
} from '../TestData'

function ts(s: number): Date {
  return new Date(TEST_NOW.getTime() + s*1000);
}

describe('events', () => {
  describe('getLastEvent', () => {
    it('gets the most recent event in the session', (done: DoneFn) => {
      testingDBWithState([
        new Event({...e.basic, timestamp: ts(0), id: 1}),
        new Event({...e.basic, timestamp: ts(1), id: 2}),
        new Event({...e.basic, timestamp: ts(2), id: 3}),
      ])
      .then((db) => getLastEvent(db, e.basic.session))
      .then((i: EventInstance) => {
        expect(new Event(i.dataValues).id).toEqual(3);
        done();
      })
      .catch(done.fail);
    });
  });

  describe('getOrderedEventsAfter', () => {
    it('gets an ordered list of events after the start time', (done: DoneFn) => {
      testingDBWithState([
        new Event({...e.basic, timestamp: ts(0), id: 1}),
        new Event({...e.basic, timestamp: ts(1), id: 2}),
        new Event({...e.basic, timestamp: ts(2), id: 3}),
        new Event({...e.basic, timestamp: ts(3), id: 4}),
      ])
      .then((db) => getOrderedEventsAfter(db, e.basic.session, 2))
      .then((results: EventInstance[]) => {
        expect(results.length).toEqual(2);
        // Descending order of time
        expect(new Event(results[0].dataValues).id).toEqual(4);
        expect(new Event(results[1].dataValues).id).toEqual(3);
        done();
      })
      .catch(done.fail);
    });
  });

  describe('commitEvent', () => {
    it('rejects events with a most recent ID but not matching JSON', (done: DoneFn) => {
      testingDBWithState([
        new Session({...s.basic, id: e.basic.session, eventCounter: 3}),
        new Event({...e.basic, timestamp: ts(0), id: 3, json: 'OLD_EVENT_DIFFERENT_JSON'}),
      ])
      .then((db) => commitEvent(db, e.basic.session, e.basic.client, e.basic.instance, 3, e.basic.type, e.basic.json))
      .then(() => done.fail('expected error'))
      .catch((e: Error) => {
        expect(e.toString()).toContain('mismatch');
        done();
      });
    });
    it('rejects events with a too-large ID', (done: DoneFn) => {
      testingDBWithState([
        new Session({...s.basic, id: e.basic.session, eventCounter: 3}),
        new Event({...e.basic, timestamp: ts(0), id: 3}),
      ])
      .then((db) => commitEvent(db, e.basic.session, e.basic.client, e.basic.instance, 5, e.basic.type, e.basic.json))
      .then(() => done.fail('expected error'))
      .catch((e: Error) => {
        expect(e.toString()).toContain('mismatch');
        done();
      });
    });
    it('lazily accepts events that have already happened', (done: DoneFn) => {
      testingDBWithState([
        new Session({...s.basic, id: e.basic.session, eventCounter: 3}),
        new Event({...e.basic, timestamp: ts(0), id: 3}), // Matches this one
        new Event({...e.basic, timestamp: ts(1), id: 4}),
      ])
      .then((db) => commitEvent(db, e.basic.session, e.basic.client, e.basic.instance, 3, e.basic.type, e.basic.json))
      .then((result: number|null) => {
        expect(result).toEqual(null);
        done();
      })
      .catch(done.fail);
    });
    it('rejects events that do not belong to a known session', (done: DoneFn) => {
      testingDBWithState([])
      .then((db) => commitEvent(db, e.basic.session, e.basic.client, e.basic.instance, 3, e.basic.type, e.basic.json))
      .then(() => done.fail('expected session not found'))
      .catch((e: Error) => {
        expect(e.toString()).toContain('could not find session');
        done();
      });
    });
    it('accepts events with the correct next id', (done: DoneFn) => {
      let db: Database;
      const n = 3;
      testingDBWithState([
        new Session({...s.basic, id: e.basic.session, eventCounter: n}),
        new Event({...e.basic, timestamp: ts(0), id: n}),
      ])
      .then((tdb) => {
        db = tdb;
        return commitEvent(db, e.basic.session, e.basic.client, e.basic.instance, n+1, e.basic.type, e.basic.json)
      })
      .then((result: number|null) => {
        expect(result).toEqual(n+1);
        return db.events.findOne({where: {id: n+1}})
      })
      .then((i: EventInstance) => {
        // Event is inserted
        expect(new Event(i.dataValues).id).toEqual(n+1);
        return db.sessions.findOne({where: {id: e.basic.session}});
      })
      .then((i: SessionInstance) => {
        // Event counter is updated
        expect(new Session(i.dataValues).eventCounter).toEqual(n+1);
        done();
      })
      .catch(done.fail);
    });
  });

  describe('getLargestEventID', () => {
    it('gets the max event ID for the session', (done: DoneFn) => {
      testingDBWithState([
        new Event({...e.basic, timestamp: ts(0), id: 1}),
        new Event({...e.basic, timestamp: ts(1), id: 2}),
        new Event({...e.basic, timestamp: ts(2), id: 3}),
        new Event({...e.basic, timestamp: ts(3), id: 4}),
      ])
      .then((db) => getLargestEventID(db, e.basic.session))
      .then((result: number) => {
        expect(result).toEqual(4);
        done();
      })
      .catch(done.fail);
    });

    it('returns 0 if no event in session', (done: DoneFn) => {
      testingDBWithState([])
      .then((db) => getLargestEventID(db, e.basic.session))
      .then((result: number) => {
        expect(result).toEqual(0);
        done();
      })
      .catch(done.fail);
    });
  });

  describe('commitEventWithoutID', () => {
    it('inserts an event with an automatically-determined ID', (done: DoneFn) => {
      let db: Database;
      const n = 3;
      testingDBWithState([
        new Session({...s.basic, id: e.basic.session, eventCounter: n}),
        new Event({...e.basic, timestamp: ts(0), id: n, json: 'OLD_EVENT_DIFFERENT_JSON'}),
      ])
      .then((tdb) => {
        db = tdb;
        return commitEventWithoutID(db, e.basic.session, e.basic.client, e.basic.instance, e.basic.type, JSON.parse(e.basic.json));
      })
      .then((result: number|null) => {
        expect(result).toEqual(n+1);
        return db.events.findOne({where: {id: n+1}});
      })
      .then((i: EventInstance) => {
        // Event is inserted; ID is applied to event JSON
        const result = new Event(i.dataValues);
        expect(result.id).toEqual(n+1);
        expect(JSON.parse(result.json).id).toEqual(n+1);
        return db.sessions.findOne({where: {id: e.basic.session}});
      })
      .then((i: SessionInstance) => {
        // Event counter is updated
        expect(new Session(i.dataValues).eventCounter).toEqual(n+1);
        done();
      })
      .catch(done.fail);
    });
    it('lazily accepts if it matches the most recent event', (done: DoneFn) => {
      // TODO: This doesn't prevent multiple commits if something sneaks in between retries
      testingDBWithState([
        new Session({...s.basic, id: e.basic.session, eventCounter: 4}),
        new Event({...e.basic, timestamp: ts(0), id: 3}), // Matches this one
        new Event({...e.basic, timestamp: ts(1), id: 4}),
      ])
      .then((db) => commitEventWithoutID(db, e.basic.session, e.basic.client, e.basic.instance, e.basic.type, JSON.parse(e.basic.json)))
      .then((result: number|null) => {
        expect(result).toEqual(4);
        done();
      })
      .catch(done.fail);
    });
    it('rejects events that do not belong to a known session', (done: DoneFn) => {
      testingDBWithState([])
      .then((db) => commitEventWithoutID(db, e.basic.session, e.basic.client, e.basic.instance, e.basic.type, e.basic.json))
      .then(() => done.fail('expected session not found'))
      .catch((e: Error) => {
        expect(e.toString()).toContain('could not find session');
        done();
      });
    });
  });
});

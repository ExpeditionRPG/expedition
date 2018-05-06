import {Event, EventInstance} from './Events'
import {Event as EventAttributes} from 'expedition-qdl/lib/schema/multiplayer/Events'
import Sequelize from 'sequelize'

describe('events', () => {
  let e: Event;

  beforeEach((done: DoneFn) => {
    const s = new Sequelize({dialect: 'sqlite', storage: ':memory:'});
    e = new Event(s);
    e.model.sync()
      .then(() => done())
      .catch(done.fail);
  });

  describe('upsert', () => {
    it('is valid without json field', (done: DoneFn) => {
      e.upsert(new EventAttributes({id: 1, json: undefined, session: 0, client: 'testclient', instance: 'testinstance', timestamp: new Date(), type: 'test'}))
        .then(() => {
          return e.getLast(0);
        })
        .then((i: EventInstance|null) => {
          if (!i) {
            throw Error('no event instance found!');
          }
          expect(i.get('id')).toEqual(1);
          expect(i.get('json')).not.toBeTruthy();
          done();
        })
        .catch(done.fail);
    });
  });

  describe('getLast', () => {
    it('gets the most recent event in the session');
  });

  describe('getById', () => {
    it('gets the event with the given ID');
  });

  describe('getCurrentQuestTitle', () => {
    it('gets the title of the current quest');
  });

  describe('getOrderedAfter', () => {
    it('gets an ordered list of events after the start time');
  });
});

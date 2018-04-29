import {Event, EventInstance} from './Events'

const Sequelize = require('sequelize');

describe('events', () => {
  let e: Event;

  beforeEach((done: DoneFn) => {
    const s = new Sequelize({dialect: 'sqlite', storage: ':memory:'});
    e = new Event(s);
    e.model.sync().then(() => {done();}).catch((e: Error) => {throw e;});
  });

  describe('upsert', () => {
    it('is valid without json field', (done: DoneFn) => {
      e.upsert({id: 1, json: undefined, session: 0, client: 'testclient', instance: 'testinstance', timestamp: new Date(), type: 'test'})
        .then(() => {
          return e.getLast(0);
        })
        .then((i: EventInstance|null) => {
          if (!i) {
            throw Error('no event instance found!');
          }
          expect(i.get('id')).toEqual(1);
          expect(i.get('json')).not.toBeTruthy();
        })
        .catch((e: Error) => {throw e;})
        .finally(done);
    });
  });

  describe('getlast', () => {
    it('gets the most recent event in the session');
  });
});

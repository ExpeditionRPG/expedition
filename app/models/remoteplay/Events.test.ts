import {Event, EventAttributes, EventInstance} from './Events'
import * as Sequelize from 'sequelize'

describe('events', () => {
  let e: Event;

  beforeEach((done: DoneFn) => {
    const s = new Sequelize({dialect: 'sqlite', storage: ':memory:'});
    e = new Event(s);
    e.model.sync().then(() => {done();}).catch((e: Error) => {throw e;});
  });

  describe('upsert', () => {
    it('is valid without id and json field', (done: DoneFn) => {
      e.upsert({id: undefined, json: undefined, session: 0, client: 'testclient', timestamp: new Date(), type: 'test'})
        .then(() => {
          return e.getLast(0);
        })
        .then((i: EventInstance|null) => {
          if (!i || !i.dataValues) {
            throw Error('no event instance found!');
          }
          expect(i.dataValues.id).not.toBeTruthy();
          expect(i.dataValues.json).not.toBeTruthy();
        })
        .catch((e: Error) => {throw e;})
        .finally(done);
    });
  });
});

import {Session} from './Sessions'
import Sequelize from 'sequelize'

describe('sessions', () => {
  let ss: Session;
  beforeEach((done: DoneFn) => {
    const s = new Sequelize({dialect: 'sqlite', storage: ':memory:'});
    ss = new Session(s);
    ss.model.sync()
      .then(() => done())
      .catch(done.fail);
  });

  describe('commitEvent', () => {
    it('rejects events with a mismatched increment counter');
    it('rejects events that do not belong to a known session');
  });

  describe('create', () => {
    it('creates a new session', (done) => {
      ss.create()
        .then((instance) => {
          expect(instance.get('secret')).toBeDefined();
          expect(instance.get('id')).toBeDefined();
          done();
        })
        .catch(done.fail);
    });
  });
  describe('get', () => {
    it('gets the session');
  });

  describe('getBySecret', () => {
    it('gets the session with the secret');
  });

  describe('getLargestEventID', () => {
    it('gets the max event ID for the session');
  });

  describe('getOrderedAfter', () => {
    it('gets the ordered list of events after the start time');
  });

  describe('commitEventWithoutID', () => {
    it('inserts an event with an automatically-determined ID');
  });

});

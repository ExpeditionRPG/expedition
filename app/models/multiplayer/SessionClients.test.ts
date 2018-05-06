import {SessionClient, SessionClientInstance} from './SessionClients'
import {SessionClient as SessionClientAttributes} from 'expedition-qdl/lib/schema/multiplayer/SessionClients'
import Sequelize from 'sequelize'

const testData = new SessionClientAttributes({session: 12345, client: 'testclient', secret: 'abcd'});

describe('SessionClients', () => {
  let sc: SessionClient;
  beforeEach((done: DoneFn) => {
    const s = new Sequelize({dialect: 'sqlite', storage: ':memory:'});
    sc = new SessionClient(s);
    sc.model.sync()
      .then(() => done())
      .catch(done.fail);
  });

  describe('getSessionsByClient', () => {
    it('gets sessions the client has joined with the most recent activity');
  });

  describe('get', () => {
    it('gets the session client instance');
  });

  describe('verify', () => {
    it('returns true if the client exists in the session, matching secret');
    it('returns false otherwise');
  });

  describe('upsert', () => {
    it('inserts an entry', (done: DoneFn) => {
      sc.upsert(testData.session, testData.client, testData.secret)
        .then(() => {
          return sc.get(testData.session, testData.client);
        })
        .then((c: SessionClientInstance) => {
          expect(new SessionClientAttributes(c.dataValues)).toEqual(testData);
          done();
        })
        .catch(done.fail);
    });
  });
});

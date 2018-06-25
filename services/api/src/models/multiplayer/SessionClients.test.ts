import {SessionClientInstance} from '../Database'
import {SessionClient} from 'shared/schema/multiplayer/SessionClients'
import {
  verifySessionClient,
  getClientSessions,
} from './SessionClients'
import {
  testingDBWithState,
  sessionClients as sc,
} from '../TestData'

describe('SessionClients', () => {
  describe('verifySessionClient', () => {
    it('returns true if the client exists in the session, matching secret', (done: DoneFn) => {
      testingDBWithState([sc.basic])
      .then((db) => verifySessionClient(db, sc.basic.session, sc.basic.client, sc.basic.secret))
      .then((valid: boolean) => {
        expect(valid).toEqual(true);
        done();
      })
      .catch(done.fail);
    });

    it('returns false otherwise', (done: DoneFn) => {
      testingDBWithState([])
      .then((db) => verifySessionClient(db, sc.basic.session, sc.basic.client, sc.basic.secret))
      .then((valid: boolean) => {
        expect(valid).toEqual(false);
        done();
      })
      .catch(done.fail);
    });
  });

  describe('getClientSessions', () => {
    it('gets sessions the client has joined with the most recent activity', (done: DoneFn) => {
      testingDBWithState([sc.basic])
      .then((db) => getClientSessions(db, sc.basic.client))
      .then((results: SessionClientInstance[]) => {
        expect(results.length).toEqual(1);
        expect(new SessionClient(results[0].dataValues)).toEqual(sc.basic);
        done();
      })
      .catch(done.fail);
    });
  });
});

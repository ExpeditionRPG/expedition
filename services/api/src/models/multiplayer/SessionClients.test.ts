import { SessionClient } from 'shared/schema/multiplayer/SessionClients';
import { SessionClientInstance } from '../Database';
import { sessionClients as sc, testingDBWithState } from '../TestData';
import { getClientSessions, verifySessionClient } from './SessionClients';

interface DoneFn {
  (): void;
  fail: (error: Error) => void;
}

describe('SessionClients', () => {
  describe('verifySessionClient', () => {
    test('returns true if the client exists in the session, matching secret', (done: DoneFn) => {
      testingDBWithState([sc.basic])
        .then(db =>
          verifySessionClient(
            db,
            sc.basic.session,
            sc.basic.client,
            sc.basic.secret,
          ),
        )
        .then((valid: boolean) => {
          expect(valid).toEqual(true);
          done();
        })
        .catch(done.fail);
    });

    test('returns false otherwise', (done: DoneFn) => {
      testingDBWithState([])
        .then(db =>
          verifySessionClient(
            db,
            sc.basic.session,
            sc.basic.client,
            sc.basic.secret,
          ),
        )
        .then((valid: boolean) => {
          expect(valid).toEqual(false);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('getClientSessions', () => {
    test('gets sessions the client has joined with the most recent activity', (done: DoneFn) => {
      testingDBWithState([sc.basic])
        .then(db => getClientSessions(db, sc.basic.client))
        .then((results: SessionClientInstance[]) => {
          expect(results.length).toEqual(1);
          expect(new SessionClient(results[0].dataValues)).toEqual(sc.basic);
          done();
        })
        .catch(done.fail);
    });
  });
});

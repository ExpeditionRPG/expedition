import {BrokerBase, InMemoryBroker, Session, SessionSecret} from './Broker'
import * as Bluebird from 'bluebird';

describe('Broker', () => {

  let broker: BrokerBase;
  beforeEach(() => {
    broker = new InMemoryBroker();
  })

  describe('createSession', () => {
    it('creates an unlocked session', (done) => {
      broker.createSession()
        .then((s: Session) => {
          expect(s.lock).toBe(null);
          expect(s.id).toBeDefined();
          expect(s.secret).toBeDefined();
          done();
        });
    });
    it('randomizes secrets between sessions', (done) => {
      const secrets = new Set<SessionSecret>();

      const sessions = [];
      for (let i = 0; i < 100; i++) {
        sessions.push(broker.createSession().then((s: Session) => {
          expect(secrets.has(s.secret)).toEqual(false);
          secrets.add(s.secret);
        }));
      }
      Promise.all(sessions).then(() => {done()});
    });
  });

  describe('joinSession', () => {
    it('joins session if secret matches');
    it('fails to join session if secret does not match');
    it('fails to join session if it is locked');
  });

  describe('lockSession', () => {
    it('locks existing session');
    it('treats already locked session as success');
    it('fails when session does not exist');
  });

});

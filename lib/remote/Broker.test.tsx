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
    it('joins session if secret matches', (done) => {
      broker.createSession()
        .then((s: Session) => {
          return broker.joinSession('testclient', s.secret);
        })
        .then(() => {
          done();
        });
    });
    it('fails to join session if secret does not match', (done) => {
      broker.createSession()
        .then((s: Session) => {
          return broker.joinSession('testclient', s.secret + 'A');
        })
        .catch((e) => {
          done();
        });
    });
    it('fails to join session if it is locked', (done) => {
      let secret: string = null;
      broker.createSession()
        .then((s: Session) => {
          secret = s.secret;
          return broker.lockSession(s.id);
        })
        .then(() => {
          return broker.joinSession('testclient', secret);
        })
        .catch((e) => {
          done();
        });
    });
  });

  describe('lockSession', () => {
    it('locks existing session', (done) => {
      broker.createSession()
        .then((s: Session) => {
          return broker.lockSession(s.id);
        })
        .then(() => {
          done();
        });
    });
    it('treats already locked session as success', (done) => {
      let session: SessionID = null;
      broker.createSession()
        .then((s: Session) => {
          session = s.id;
          return broker.lockSession(session);
        })
        .then((s: Session) => {
          return broker.lockSession(session);
        })
        .then(() => {
          done();
        });
    });
    it('fails when session does not exist', (done) => {
      let session: SessionID = null;
      broker.lockSession('nonexistant_session_id')
        .catch((e) => {
          done();
        });
    });
  });

});

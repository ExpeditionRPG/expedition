import {Session} from '@expedition-qdl/schema/multiplayer/Sessions'
import {SessionInstance} from '../Database'
import {
  createSession,
  getSessionBySecret,
  getSessionQuestTitle,
} from './Sessions'
import {
  testingDBWithState,
  sessions as s,
  events as e,
  quests as q,
} from '../TestData'

describe('sessions', () => {
  describe('createSession', () => {
    it('creates a new session', (done: DoneFn) => {
      testingDBWithState([])
      .then((db) => createSession(db))
      .then((i: SessionInstance) => {
        expect(new Session(i.dataValues)).toEqual(jasmine.objectContaining({eventCounter: 0, locked: false}));
        done();
      })
      .catch(done.fail);
    });
  });

  describe('getSessionBySecret', () => {
    it('gets the session with the secret', (done: DoneFn) => {
      testingDBWithState([s.basic])
      .then((db) => getSessionBySecret(db, s.basic.secret))
      .then((i: SessionInstance) => {
        expect(new Session(i.dataValues)).toEqual(s.basic);
        done();
      })
      .catch(done.fail);
    });
  });

  describe('getSessionQuestTitle', () => {
    it('gets the title of the current quest', (done: DoneFn) => {
      testingDBWithState([e.questPlay])
      .then((db) => getSessionQuestTitle(db, s.basic.id))
      .then((title: string|null) => {
        expect(title).toEqual(q.basic.title);
        done();
      })
      .catch(done.fail);
    });

    it('returns null if no current quest in the session', (done: DoneFn) => {
      testingDBWithState([])
      .then((db) => getSessionQuestTitle(db, s.basic.id))
      .then((title: string|null) => {
        expect(title).toEqual(null);
        done();
      })
      .catch(done.fail);
    });
  });
});

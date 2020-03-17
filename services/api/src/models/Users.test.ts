import { AnalyticsEvent } from 'shared/schema/AnalyticsEvents';
import { Database } from './Database';
import {
  analyticsEvents as ae,
  quests as q,
  testingDBWithState,
  userBadges as b,
  users as u,
} from './TestData';
import {
  getUser,
  getUserBadges,
  getUserQuests,
  incrementLoginCount,
  maybeGetUserByEmail,
  setLootPoints,
  subscribeToCreatorsList,
} from './Users';

describe('users', () => {
  describe('incrementLoginCount', () => {
    test('increments for existing user', done => {
      let db: Database;
      testingDBWithState([u.basic])
        .then(tdb => {
          db = tdb;
          return incrementLoginCount(db, u.basic.id);
        })
        .then(() => {
          return getUser(db, u.basic.id);
        })
        .then(r => {
          expect(r.loginCount).toEqual(u.basic.loginCount + 1);
          expect(r.lastLogin.getTime()).toBeGreaterThan(
            u.basic.lastLogin.getTime(),
          );
          done();
        })
        .catch(done.fail);
    });
  });

  describe('setLootPoints', () => {
    test('sets the loot points', done => {
      let db: Database;
      testingDBWithState([u.basic])
        .then(tdb => {
          db = tdb;
          return setLootPoints(db, u.basic.id, 37);
        })
        .then(() => {
          return getUser(db, u.basic.id);
        })
        .then(user => {
          expect(user.lootPoints).toEqual(37);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('subscribeToCreatorsList', () => {
    test('subscribes to creators list', () => {
      const mc = {
        post: jasmine.createSpy('post').and.returnValue(Promise.resolve('')),
      };
      subscribeToCreatorsList(mc, u.basic.email);
      expect(mc.post).toHaveBeenCalledWith(jasmine.any(String), {
        email_address: u.basic.email,
        status: 'subscribed',
      });
    });
  });

  describe('getUserQuests', () => {
    test('returns valid results for players without quest history', done => {
      testingDBWithState([u.basic])
        .then(tdb => {
          return getUserQuests(tdb, u.basic.id);
        })
        .then(result => {
          expect(result).toEqual({});
          done();
        })
        .catch(done.fail);
    });

    test('returns valid results for players with quest history', done => {
      testingDBWithState([
        u.basic,
        q.basic,
        new AnalyticsEvent({ ...ae.questEnd, userID: u.basic.id }),
      ])
        .then(tdb => {
          return getUserQuests(tdb, u.basic.id);
        })
        .then(quests => {
          expect(Object.keys(quests).length).toEqual(1);
          const result = quests[ae.questEnd.questID];
          expect(result.lastPlayed).toEqual(ae.questEnd.created);
          expect(result.details.title).toEqual(q.basic.title);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('getUserBadges', () => {
    test('returns user badges', done => {
      testingDBWithState([b.basic])
        .then(tdb => {
          return getUserBadges(tdb, b.basic.userid);
        })
        .then(result => {
          expect(result).toEqual([b.basic.badge]);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('maybeGetUserByEmail', () => {
    test('returns user if exists', done => {
      testingDBWithState([u.basic])
        .then(tdb => {
          return maybeGetUserByEmail(tdb, u.basic.email);
        })
        .then(user => {
          expect((user || { id: null }).id).toEqual(u.basic.id);
          done();
        })
        .catch(done.fail);
    });

    test('returns null if not exists', done => {
      testingDBWithState([])
        .then(tdb => {
          return maybeGetUserByEmail(tdb, u.basic.email);
        })
        .then(user => {
          expect(user).toEqual(null);
          done();
        })
        .catch(done.fail);
    });
  });
});

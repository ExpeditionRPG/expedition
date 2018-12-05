import {AnalyticsEvent} from 'shared/schema/AnalyticsEvents';
import {Database} from './Database';
import {analyticsEvents as ae,
  quests as q,
  testingDBWithState,
  users as u
} from './TestData';
import {
  getUser,
  getUserQuests,
  incrementLoginCount,
  setLootPoints,
  subscribeToCreatorsList,
  maybeGetUserByEmail
} from './Users';

describe('users', () => {
  describe('incrementLoginCount', () => {
    test('increments for existing user', (done: DoneFn) => {
      let db: Database;
      testingDBWithState([u.basic])
        .then((tdb) => {
          db = tdb;
          return incrementLoginCount(db, u.basic.id);
        })
        .then(() => {
          return getUser(db, u.basic.id);
        })
        .then((r) => {
          expect(r.loginCount).toEqual(u.basic.loginCount + 1);
          expect(r.lastLogin.getTime()).toBeGreaterThan(u.basic.lastLogin.getTime());
          done();
        })
        .catch(done.fail);
    });
  });

  describe('setLootPoints', () => {
    test('sets the loot points', (done: DoneFn) => {
      let db: Database;
      testingDBWithState([u.basic]).then((tdb) => {
        db = tdb;
        return setLootPoints(db, u.basic.id, 37);
      })
      .then(() => {
        return getUser(db, u.basic.id);
      })
      .then((user) => {
        expect(user.lootPoints).toEqual(37);
        done();
      })
      .catch(done.fail);
    });
  });

  describe('subscribeToCreatorsList', () => {
    test('subscribes to creators list', () => {
      const mc = {post: jasmine.createSpy('post').and.returnValue(Promise.resolve(''))};
      subscribeToCreatorsList(mc, u.basic.email);
      expect(mc.post).toHaveBeenCalledWith(jasmine.any(String), {
        email_address: u.basic.email,
        status: 'subscribed',
      });
    });
  });

  describe('getUserQuests', () => {
    test('returns valid results for players without quest history', (done: DoneFn) => {
      testingDBWithState([u.basic]).then((tdb) => {
        return getUserQuests(tdb, u.basic.id);
      })
      .then((result) => {
        expect(result).toEqual({});
        done();
      })
      .catch(done.fail);
    });

    test('returns valid results for players with quest history', (done: DoneFn) => {
      testingDBWithState([
        u.basic,
        q.basic,
        new AnalyticsEvent({...ae.questEnd, userID: u.basic.id}),
      ])
      .then((tdb) => {
        return getUserQuests(tdb, u.basic.id);
      })
      .then((quests) => {
        expect(Object.keys(quests).length).toEqual(1);
        const result = quests[ae.questEnd.questID];
        expect(result.lastPlayed).toEqual(ae.questEnd.created);
        expect(result.details.title).toEqual(q.basic.title);
        done();
      }).catch(done.fail);
    });
  });

  describe('maybeGetUserByEmail', () => {
    test('returns user if exists', () => {
      testingDBWithState([u.basic]).then((tdb) => {
        return maybeGetUserByEmail(u.basic.email);
      }).then((user) => {
        expect(user.id).toEqual(u.basic.id);
      });
    });

    test('returns null if not exists', () => {
      testingDBWithState([]).then((tdb) => {
        return maybeGetUserByEmail(u.basic.email);
      }).then((user) => {
        expect(user).toEqual(null);
      });
    });
  })
});

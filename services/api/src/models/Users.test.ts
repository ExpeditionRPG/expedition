import {
  incrementLoginCount,
  getUser,
  setLootPoints,
  getUserQuests,
  subscribeToCreatorsList
} from './Users'
import {testingDBWithState,
  users as u,
  analyticsEvents as ae
} from './TestData'
import {Database} from './Database'
import {AnalyticsEvent} from 'shared/schema/AnalyticsEvents'

describe('users', () => {
  describe('incrementLoginCount', () => {
    it('increments for existing user', (done: DoneFn) => {
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
          done();
        })
        .catch(done.fail);
    });
  });

  describe('setLootPoints', () => {
    fit('sets the loot points', (done: DoneFn) => {
      let db: Database;
      testingDBWithState([u.basic]).then((tdb) => {
        db = tdb;
        return setLootPoints(db, u.basic.id, 37);
      })
      .then(() => {
        return getUser(db, u.basic.id);
      })
      .then((u) => {
        expect(u.lootPoints).toEqual(37);
        done();
      })
      .catch(done.fail);
    });
  });

  describe('subscribeToCreatorsList', () => {
    it('subscribes to creators list', () => {
      const mc = {post: jasmine.createSpy('post')};
      subscribeToCreatorsList(mc, u.basic.email);
      expect(mc.post).toHaveBeenCalledWith(jasmine.any(String), {
        email_address: u.basic.email,
        status: 'subscribed',
      });
    });
  });

  describe('getUserQuests', () => {
    it('returns valid results for players without quest history', (done: DoneFn) => {
      testingDBWithState([u.basic]).then((tdb) => {
        return getUserQuests(tdb, u.basic.id);
      })
      .then((result) => {
        expect(result).toEqual({});
        done();
      })
      .catch(done.fail);
    });

    it('returns valid results for players with quest history', (done: DoneFn) => {
      testingDBWithState([
        u.basic,
        new AnalyticsEvent({...ae.questEnd, userID: u.basic.id}),
      ])
      .then((tdb) => {
        return getUserQuests(tdb, u.basic.id);
      })
      .then((quests) => {
        expect(Object.keys(quests).length).toEqual(1);
        const result = quests[ae.questEnd.questID];
        expect(result.lastPlayed).toEqual(ae.questEnd.created);
        done();
      }).catch(done.fail);
    });
  });
});

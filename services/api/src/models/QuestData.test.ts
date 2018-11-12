import {QuestData} from 'shared/schema/QuestData';
import {QuestDataInstance} from './Database';
import {getNewestQuestData, saveQuestData} from './QuestData';
import {
  questData as qd,
  testingDBWithState,
  TEST_NOW,
} from './TestData';

const Moment = require('moment');

describe('quest', () => {
  describe('searchQuests', () => {
    test('returns matching quest ID and user ID in single case', (done) => {
      testingDBWithState([qd.basic])
        .then((tdb) => {
          return getNewestQuestData(tdb, qd.basic.id, qd.basic.userid);
        })
        .then((results) => {
          expect(results).toEqual(qd.basic);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('saveQuestData', () => {
    const new1 = new QuestData({...qd.basic, created: new Date(TEST_NOW - 23*60*60*1000)}); // <24h
    const old1 = new QuestData({...qd.basic, created: new Date(TEST_NOW - 25*60*60*1000)});
    const old2 = new QuestData({...qd.basic, created: new Date(TEST_NOW - 26*60*60*1000)}); // older
    const otheruser1 = new QuestData({...qd.basic, userid: 'otheruser', created: new Date(TEST_NOW - 25*60*60*1000)});

    test('adds if <2 rows', (done) => {
      let db = null;
      testingDBWithState([old1, old2]).then((tdb) => {
        db = tdb;
        return saveQuestData(tdb, new1, new1.created.getTime());
      })
      .then(() => return saveQuestData(db, qd.basic, qd.basic.created.getTime()))
      .then(() => return db.questData.findAll())
      .then((results) => {
        expect(results.length).toEqual(2);
        done();
      })
      .catch(done.fail);
    });

    test('overwrites oldest if all >24h', (done) => {
      let db = null;
      testingDBWithState([old1, old2]).then((tdb) => {
        db = tdb;
        return saveQuestData(tdb, qd.basic, TEST_NOW.getTime());
      })
      .then(() => return db.questData.findAll())
      .then((results) => {
        expect(results).toContainEqual(jasmine.objectContaining({created: qd.basic.created}));
        expect(results).toContainEqual(jasmine.objectContaining({created: old1.created}));
        expect(results).not.toContainEqual(jasmine.objectContaining({created: old2.created}));
        done();
      })
      .catch(done.fail);
    });

    test('overwrites newest if at least one <24h', (done) => {
      let db = null;
      testingDBWithState([old2, new1]).then((tdb) => {
        db = tdb;
        return saveQuestData(tdb, qd.basic, TEST_NOW.getTime());
      })
      .then(() => return db.questData.findAll())
      .then((results) => {
        expect(results).toContainEqual(jasmine.objectContaining({created: qd.basic.created}));
        expect(results).toContainEqual(jasmine.objectContaining({created: old2.created}));
        expect(results).not.toContainEqual(jasmine.objectContaining({created: new1.created}));
        done();
      })
      .catch(done.fail);
    });

    test('does not affect other users\' saved quests', (done) => {
      let db = null;
      testingDBWithState([otheruser1, old2]).then((tdb) => {
        db = tdb;
        return saveQuestData(tdb, qd.basic, TEST_NOW.getTime());
      })
      .then(() => return db.questData.findAll())
      .then((results) => {
        expect(results).toContainEqual(jasmine.objectContaining({created: otheruser1.created}));
        done();
      })
      .catch(done.fail);
    });
  });

  describe.only('getNewestQuestData', () => {
    test('gets newest quest data', (done) => {
      const new1 = new QuestData({...qd.basic, created: new Date(TEST_NOW - 23*60*60*1000)}); // <24h
      const old1 = new QuestData({...qd.basic, created: new Date(TEST_NOW - 25*60*60*1000)});
      let db = null;
      testingDBWithState([new1, old1]).then((tdb) => {
        return getNewestQuestData(tdb, qd.basic.id, qd.basic.userid);
      })
      .then((result) => {
        expect(result.created).toEqual(new1.created);
        done();
      })
      .catch(done.fail);
    });
  });
});

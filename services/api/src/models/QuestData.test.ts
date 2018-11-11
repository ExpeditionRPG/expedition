import {QuestData} from 'shared/schema/QuestData';
import {QuestDataInstance} from './Database';
import {getNewestQuestData} from './QuestData';
import {
  questData as qd,
  testingDBWithState,
} from './TestData';

const Moment = require('moment');

describe('quest', () => {
  describe('searchQuests', () => {
    test('returns matching quest ID and user ID in single case', (done: DoneFn) => {
      console.log('insertios');
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
});

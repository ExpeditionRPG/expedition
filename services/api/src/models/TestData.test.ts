import { AnalyticsEvent } from 'shared/schema/AnalyticsEvents';
import { analyticsEvents as ae, testingDBWithState } from './TestData';

interface DoneFn {
  (): void;
  fail: (error: Error) => void;
}

describe('Test Data', () => {
  describe('testingDBWithState', () => {
    test('Creates an unpopulated testing DB when empty', (done: DoneFn) => {
      testingDBWithState([])
        .then(db => {
          return db.analyticsEvent.create(ae.action);
        })
        .then(() => done())
        .catch(done.fail);
    });
    test('Creates a testing DB with records', (done: DoneFn) => {
      testingDBWithState([ae.action])
        .then(db => {
          return db.analyticsEvent.findOne({
            where: { userID: ae.action.userID },
          });
        })
        .then(result => {
          if (!result) {
            throw new Error('Expected entry');
          }
          expect(new AnalyticsEvent(result.get())).toEqual(ae.action);
          done();
        })
        .catch(done.fail);
    });
  });
});

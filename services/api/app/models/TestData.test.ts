import {testingDBWithState, analyticsEvents as ae} from './TestData'
import {AnalyticsEvent} from 'expedition-qdl/schema/AnalyticsEvents'

describe('Test Data', () => {
  describe('testingDBWithState', () => {
    it('Creates an unpopulated testing DB when empty', (done: DoneFn) => {
      testingDBWithState([])
        .then((db) => {
          return db.analyticsEvent.create(ae.action);
        })
        .then(() => done())
        .catch(done.fail);
    });
    it('Creates a testing DB with records', (done: DoneFn) => {
      testingDBWithState([ae.action])
        .then((db) => {
          return db.analyticsEvent.findOne({where: {userID: ae.action.userID}});
        })
        .then((result) => {
          if (!result) {
            throw new Error('Expected entry');
          }
          expect(new AnalyticsEvent(result.dataValues)).toEqual(ae.action);
          done();
        })
        .catch(done.fail);
    })
  })
});

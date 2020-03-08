import * as Promise from 'bluebird';
import { Partition } from 'shared/schema/Constants';
import { Feedback } from 'shared/schema/Feedback';
import { MailService } from '../Mail';
import { Database, FeedbackInstance } from './Database';
import {
  FabricateFeedbackEmail,
  FabricateReportQuestEmail,
  getFeedback,
  submitFeedback,
  submitRating,
  submitReportQuest,
} from './Feedback';
import { getQuest } from './Quests';
import { feedback as fb, quests as q, testingDBWithState } from './TestData';

interface DoneFn {
  (): void;
  fail: (error: Error) => void;
}

describe('feedback', () => {
  let ms: MailService;
  beforeEach(() => {
    ms = { send: (e: string[], s: string, m: string) => Promise.resolve() };
  });

  describe('suppressFeedback', () => {
    test.skip('suppresses feedback', () => {
      /* TODO */
    });
  });

  describe('submitFeedback', () => {
    test('sends feedback when not in quest', done => {
      const msSendSpy = spyOn(ms, 'send');
      const feedback = new Feedback({ ...fb.basic, questid: '' });
      testingDBWithState([q.basic])
        .then(tdb =>
          submitFeedback(tdb, ms, 'feedback', feedback, '', [], null),
        )
        .then(() => {
          expect(msSendSpy).toHaveBeenCalledWith(
            [FabricateFeedbackEmail],
            jasmine.any(String),
            jasmine.any(String),
          );
          done();
        })
        .catch(done.fail);
    });

    test('sends feedback when in quest', done => {
      const msSendSpy = spyOn(ms, 'send');
      const feedback = new Feedback({ ...fb.basic });
      testingDBWithState([q.basic])
        .then(tdb =>
          submitFeedback(tdb, ms, 'feedback', feedback, '', [], null),
        )
        .then(() => {
          expect(msSendSpy).toHaveBeenCalledWith(
            [FabricateFeedbackEmail],
            jasmine.any(String),
            jasmine.any(String),
          );
          // Quest info is resolved
          expect(msSendSpy.calls.first().args[2]).toContain('Test Quest');
          expect(msSendSpy.calls.first().args[2]).toContain(fb.basic.questline);
          done();
        })
        .catch(done.fail);
    });
    test('sends a thank-you to the reporter', done => {
      const msSendSpy = spyOn(ms, 'send');
      const feedback = new Feedback({ ...fb.basic });
      testingDBWithState([q.basic])
        .then(tdb =>
          submitFeedback(tdb, ms, 'feedback', feedback, '', [], null),
        )
        .then(() => {
          expect(msSendSpy).toHaveBeenCalledWith(
            [FabricateFeedbackEmail],
            jasmine.any(String),
            jasmine.any(String),
          );
          // Quest info is resolved
          expect(msSendSpy.calls.mostRecent().args[0]).toEqual([
            feedback.email,
          ]);
          expect(msSendSpy.calls.mostRecent().args[1]).toContain('thanks');
          done();
        })
        .catch(done.fail);
    });
  });

  describe('submitReportQuest', () => {
    test('sends report with quest ID and feedback user email', done => {
      const msSendSpy = spyOn(ms, 'send');
      testingDBWithState([q.basic])
        .then(tdb => submitReportQuest(tdb, ms, fb.report, '', null))
        .then(() => {
          expect(msSendSpy).toHaveBeenCalledWith(
            [FabricateReportQuestEmail],
            jasmine.any(String),
            jasmine.any(String),
          );
          expect(msSendSpy.calls.first().args[2]).toContain(fb.report.email);
          expect(msSendSpy.calls.first().args[2]).toContain(fb.report.questid);
          expect(msSendSpy.calls.first().args[2]).toContain(
            fb.report.questline,
          );
          done();
        })
        .catch(done.fail);
    });
    test('does NOT send to the quest author', done => {
      const msSendSpy = spyOn(ms, 'send');
      testingDBWithState([q.basic])
        .then(tdb => submitReportQuest(tdb, ms, fb.report, '', null))
        .then(() => {
          for (const call of msSendSpy.calls.all()) {
            expect(call.args[0]).not.toContain(fb.report.email);
          }
          done();
        })
        .catch(done.fail);
    });
    test('rejects reports on nonexistant quest', done => {
      const report = new Feedback({ ...fb.report, questid: 'notavalidquest' });
      testingDBWithState([q.basic])
        .then(tdb => submitReportQuest(tdb, ms, report, '', null))
        .then(done.fail)
        .catch(() => {
          done();
        });
    });
  });

  describe('submitRating', () => {
    test('fails to store feedback if no such quest exists', (done: DoneFn) => {
      const rating = new Feedback({
        ...fb.rating,
        questid: 'nonexistantquest',
      });
      testingDBWithState([q.basic])
        .then(tdb => submitRating(tdb, ms, rating, null))
        .catch((e: Error) => {
          expect(e.message.toLowerCase()).toContain('no such quest');
          done();
        })
        .catch(done.fail);
    });

    test('succeeds if performed on an existing quest', (done: DoneFn) => {
      let db: Database;
      testingDBWithState([q.basic])
        .then(tdb => {
          db = tdb;
          return submitRating(db, ms, fb.rating, null);
        })
        .then(() =>
          getFeedback(db, Partition.expeditionPublic, 'questid', 'userid'),
        )
        .then((result: FeedbackInstance) => {
          const feedbackResult = new Feedback(result.get());
          feedbackResult.setDefaults = [];
          expect(feedbackResult).toEqual(fb.rating);
          done();
        })
        .catch(done.fail);
    });

    test('succeeds if a rating was already given for the quest', (done: DoneFn) => {
      const rating2 = new Feedback({ ...fb.rating, rating: 5.0 });
      rating2.setDefaults = [];
      let db: Database;
      testingDBWithState([q.basic])
        .then(tdb => {
          db = tdb;
          return submitRating(db, ms, fb.rating, null);
        })
        .then(() => submitRating(db, ms, rating2, null))
        .then(() =>
          getFeedback(db, Partition.expeditionPublic, 'questid', 'userid'),
        )
        .then((result: FeedbackInstance) => {
          const feedbackResult = new Feedback(result.get());
          feedbackResult.setDefaults = [];
          expect(feedbackResult).toEqual(rating2);
          return getQuest(db, Partition.expeditionPublic, 'questid');
        })
        .then(quest => {
          expect(quest.ratingcount).toEqual(1);
          expect(quest.ratingavg).toEqual(5);
          done();
        })
        .catch(done.fail);
    });

    test('re-calculates quest rating avg and count on new feedback (only counting feedback with defined ratings)', (done: DoneFn) => {
      const rating1 = new Feedback({ ...fb.rating, rating: 3.0, userid: '1' });
      const rating2 = new Feedback({ ...fb.rating, rating: 4.0, userid: '2' });
      const rating3 = new Feedback({ ...fb.rating, rating: 1.0, userid: '3' });
      const ratingNull = new Feedback({ ...fb.rating, rating: 0, userid: '4' });
      let db: Database;
      testingDBWithState([q.basic])
        .then(tdb => {
          db = tdb;
          return submitRating(db, ms, rating1, null);
        })
        .then(() => submitRating(db, ms, rating2, null))
        .then(() => submitRating(db, ms, rating3, null))
        .then(() => submitRating(db, ms, ratingNull, null))
        .then(() => getQuest(db, Partition.expeditionPublic, 'questid'))
        .then(quest => {
          expect(quest.ratingcount).toEqual(3); // Null is not counted
          if (!quest.ratingavg) {
            throw Error('Undefined average rating');
          }
          expect(parseFloat(quest.ratingavg.toFixed(2))).toEqual(2.67);
          done();
        })
        .catch(done.fail);
    });

    test('excludes user email when anonymous', (done: DoneFn) => {
      const msSendSpy = spyOn(ms, 'send');
      const emails = ['email1@email.com', 'email2@email.com'];
      const rating1 = new Feedback({
        ...fb.rating,
        anonymous: true,
        email: emails[1],
      });
      const rating2 = new Feedback({
        ...fb.rating,
        anonymous: true,
        email: emails[2],
      });
      let db: Database;
      testingDBWithState([q.basic])
        .then(tdb => {
          db = tdb;
          return submitRating(db, ms, rating1, null);
        })
        .then(() => submitRating(db, ms, rating2, null))
        .then(() => {
          for (const call of msSendSpy.calls.all()) {
            for (const arg of call.args) {
              for (const e of emails) {
                expect(arg).not.toContain(e);
              }
            }
          }
          done();
        })
        .catch(done.fail);
    });
  });
});

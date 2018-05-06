import Sequelize from 'sequelize'
import {Feedback, FeedbackInstance, FabricateFeedbackEmail, FabricateReportQuestEmail} from './Feedback'
import {Quest, QuestInstance} from './Quests'
import {Feedback as FeedbackAttributes} from 'expedition-qdl/lib/schema/Feedback'
import {PUBLIC_PARTITION} from 'expedition-qdl/lib/schema/Constants'
import {PLACEHOLDER_DATE} from 'expedition-qdl/lib/schema/SchemaBase'
import {User} from './Users'
import {MailService} from '../Mail'
import * as Promise from 'bluebird';

describe('feedback', () => {
  let f: Feedback;
  let q: Quest;
  let u: User;
  let ms: MailService;

  const testFeedbackData = new FeedbackAttributes({
    created: new Date(),
    partition: PUBLIC_PARTITION,
    questid: 'questid',
    userid: 'userid',
    questversion: 1,
    rating: 0,
    text: 'This is feedback!',
    email: 'test@test.com',
    name: 'Test Testerson',
    difficulty: 'NORMAL',
    platform: 'ios',
    players: 5,
    version: '1.0.0',
    anonymous: false,
    tombstone: PLACEHOLDER_DATE,
  });
  const testRatingData = new FeedbackAttributes({
    ...testFeedbackData,
    rating: 4.0,
    text: 'This is a rating'
  });
  const testReportData = new FeedbackAttributes({
    ...testFeedbackData,
    text: 'This is a quest report'
  });

  beforeEach((done: DoneFn) => {
    const s = new Sequelize({dialect: 'sqlite', storage: ':memory:'});
    q = new Quest(s);
    q.model.sync()
      .then(() => {
        return q.model.create({
          partition: PUBLIC_PARTITION,
          id: 'questid',
          ratingavg: 0,
          ratingcount: 0,
          title: 'Test Quest',
          email: 'author@test.com'
        });
      })
      .then(() => {
        f = new Feedback(s);
        u = new User(s);
        f.associate({Quest: q});
        q.associate({Feedback: f} as any);
        q.associate({Feedback: f, User: u} as any);
        return f.model.sync();
      })
      .then(() => done())
      .catch(done.fail);
    ms = {send: (e: string[], s: string, m: string) => Promise.resolve()};
  });

  describe('submitFeedback', () => {
    it('sends feedback when not in quest', (done) => {
      const msSendSpy = spyOn(ms, 'send');
      const feedback = new FeedbackAttributes({...testFeedbackData, questid: ''});
      f.submitFeedback(ms, 'feedback', feedback, '', [])
        .then(() => {
          expect(msSendSpy).toHaveBeenCalledWith([FabricateFeedbackEmail], jasmine.any(String), jasmine.any(String));
          done();
        })
        .catch(done.fail);
    });

    it('sends feedback when in quest', (done) => {
      const msSendSpy = spyOn(ms, 'send');
      const feedback = new FeedbackAttributes({...testFeedbackData});
      f.submitFeedback(ms, 'feedback', feedback, '', [])
        .then(() => {
          expect(msSendSpy).toHaveBeenCalledWith([FabricateFeedbackEmail], jasmine.any(String), jasmine.any(String));
          // Quest info is resolved
          expect(msSendSpy.calls.first().args[2]).toContain('Test Quest');
          done();
        })
        .catch(done.fail);
    });
    it('sends a thank-you to the reporter', (done) => {
      const msSendSpy = spyOn(ms, 'send');
      const feedback = new FeedbackAttributes({...testFeedbackData});
      f.submitFeedback(ms, 'feedback', feedback, '', [])
        .then(() => {
          expect(msSendSpy).toHaveBeenCalledWith([FabricateFeedbackEmail], jasmine.any(String), jasmine.any(String));
          // Quest info is resolved
          expect(msSendSpy.calls.mostRecent().args[0]).toEqual([feedback.email]);
          expect(msSendSpy.calls.mostRecent().args[1]).toContain('thanks');
          done();
        })
        .catch(done.fail);
    });
  });;

  describe('submitReportQuest', () => {
    it('sends report with quest ID and feedback user email', (done) => {
      const msSendSpy = spyOn(ms, 'send');
      f.submitReportQuest(ms, testReportData, '')
        .then(() => {
          expect(msSendSpy).toHaveBeenCalledWith([FabricateReportQuestEmail], jasmine.any(String), jasmine.any(String));
          expect(msSendSpy.calls.first().args[2]).toContain(testReportData.email);
          expect(msSendSpy.calls.first().args[2]).toContain(testReportData.questid);
          done();
        })
        .catch(done.fail);
    });
    it('does NOT send to the quest author', (done) => {
      const msSendSpy = spyOn(ms, 'send');
      f.submitReportQuest(ms, testReportData, '')
        .then(() => {
          for (const call of msSendSpy.calls.all()) {
            expect(call.args[0]).not.toContain(testReportData.email);
          }
          done();
        })
        .catch(done.fail);
    });
    it('rejects reports on nonexistant quest', (done) => {
      const report = new FeedbackAttributes({...testReportData, questid: 'notavalidquest'});
      f.submitReportQuest(ms, report, '')
        .then(done.fail)
        .catch(() => {done();});
    });
  });

  describe('submitRating', () => {
    it('fails to store feedback if no such quest exists', (done: DoneFn) => {
      const rating = new FeedbackAttributes({...testRatingData, questid: 'nonexistantquest'});

      f.submitRating(ms, rating)
        .catch((e: Error) => {
          expect(e.message.toLowerCase()).toContain('no such quest');
          done();
        })
        .catch(done.fail);
    });

    it('succeeds if performed on an existing quest', (done: DoneFn) => {
      f.submitRating(ms, testRatingData)
        .then(() => {
          return f.get(PUBLIC_PARTITION, 'questid', 'userid');
        })
        .then((result: FeedbackInstance) => {
          const feedbackResult = new FeedbackAttributes(result.dataValues)
          feedbackResult.setDefaults = [];
          expect(feedbackResult).toEqual(testRatingData);
          done();
        })
        .catch(done.fail);
    });

    it('succeeds if a rating was already given for the quest', (done: DoneFn) => {
      const rating2 = new FeedbackAttributes({...testRatingData, rating: 5.0});
      rating2.setDefaults = [];

      f.submitRating(ms, testRatingData)
        .then(() => {
          return f.submitRating(ms, rating2);
        })
        .then(() => {
          return f.get(PUBLIC_PARTITION, 'questid', 'userid');
        })
        .then((result: FeedbackInstance) => {
          const feedbackResult = new FeedbackAttributes(result.dataValues);
          feedbackResult.setDefaults = [];
          expect(feedbackResult).toEqual(rating2);
          return q.get(PUBLIC_PARTITION, 'questid');
        })
        .then((quest: QuestInstance) => {
          expect(quest.get('ratingcount')).toEqual(1);
          expect(quest.get('ratingavg')).toEqual(5);
          done();
        })
        .catch(done.fail);
    });

    it('re-calculates quest rating avg and count on new feedback (only counting feedback with defined ratings)', (done: DoneFn) => {
      const rating1 = new FeedbackAttributes({...testRatingData, rating: 3.0, userid: '1'});
      const rating2 = new FeedbackAttributes({...testRatingData, rating: 4.0, userid: '2'});
      const rating3 = new FeedbackAttributes({...testRatingData, rating: 1.0, userid: '3'});
      const ratingNull = new FeedbackAttributes({...testRatingData, rating: 0, userid: '4'});
      f.submitRating(ms, rating1)
        .then(() => {return f.submitRating(ms, rating2);})
        .then(() => {return f.submitRating(ms, rating3);})
        .then(() => {return f.submitRating(ms, ratingNull);})
        .then(() => {
          return q.get(PUBLIC_PARTITION, 'questid');
        })
        .then((quest: QuestInstance) => {
          expect(quest.get('ratingcount')).toEqual(3); // Null is not counted
          if (!quest.get('ratingavg')) {
            throw Error('Undefined average rating');
          }
          expect(parseFloat(quest.get('ratingavg').toFixed(2))).toEqual(2.67);
          done();
        })
        .catch(done.fail);
    });

    it('excludes user email when anonymous', (done) => {
      const msSendSpy = spyOn(ms, 'send');
      const emails = ['email1@email.com', 'email2@email.com'];
      const rating1 = new FeedbackAttributes({...testRatingData, anonymous: true, email: emails[1]});
      const rating2 = new FeedbackAttributes({...testRatingData, anonymous: true, email: emails[2]});
      f.submitRating(ms, rating1)
        .then(() => f.submitRating(ms, rating2))
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

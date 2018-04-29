import {Feedback, FeedbackAttributes, FeedbackInstance} from './Feedback'
import {Quest, QuestInstance} from './Quests'
import {PUBLIC_PARTITION} from 'expedition-qdl/lib/schema/Quests'
import {User} from './Users'
import {MailService} from '../Mail'

const Sequelize = require('sequelize');
const expect = require('expect');
const sinon = require('sinon');

describe('feedback', () => {
  let f: Feedback;
  let q: Quest;
  let u: User;
  let ms: MailService;

  const testRatingData: FeedbackAttributes = {
    created: new Date(),
    partition: PUBLIC_PARTITION,
    questid: 'questid',
    userid: 'userid',
    questversion: 1,
    rating: 4.0,
    text: 'This is a rating!',
    email: 'test@test.com',
    name: 'Test Testerson',
    difficulty: 'normal',
    platform: 'ios',
    players: 5,
    version: '1.0.0',
    anonymous: false,
    tombstone: null,
  };

  describe('submitFeedback', () => {
    it('sends feedback when not in quest')
    it('sends feedback when in quest');
    it('sends a thank-you to the reporter');
  });;

  describe('submitReportQuest', () => {
    it('sends report with quest info');
    it('does NOT send to the quest author');
  });

  describe('submitRating', () => {
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
            email: 'author@test.com'
          });
        })
        .then(() => {
          f = new Feedback(s);
          u = new User(s);
          f.associate({Quest: q});
          q.associate({Feedback: f} as any);
          q.associate({Feedback: f, User: u} as any);
          f.model.sync()
            .then(() => {done();})
            .catch((e: Error) => {throw e;});
        })
        .catch((e: Error) => {throw e;});
      ms = {send: sinon.spy()};
    });

    it('fails to store feedback if no such quest exists', (done: DoneFn) => {
      const rating = {...testRatingData, questid: 'nonexistantquest'};

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
          expect(result.dataValues as any).toEqual(testRatingData);
          done();
        })
        .catch(done.fail);
    });

    it('succeeds if a rating was already given for the quest', (done: DoneFn) => {
      const rating2 = {...testRatingData, rating: 5.0};

      f.submitRating(ms, testRatingData)
        .then(() => {
          return f.submitRating(ms, rating2);
        })
        .then(() => {
          return f.get(PUBLIC_PARTITION, 'questid', 'userid');
        })
        .then((result: FeedbackInstance) => {
          expect(result.dataValues).toEqual(rating2);
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
      const rating1 = {...testRatingData, rating: 3.0, userid: '1'};
      const rating2 = {...testRatingData, rating: 4.0, userid: '2'};
      const rating3 = {...testRatingData, rating: 1.0, userid: '3'};
      const ratingNull = {...testRatingData, rating: null, userid: '4'};
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
          expect(quest.get('ratingavg').toFixed(2)).toEqual(2.67);
          done();
        })
        .catch(done.fail);
    });

    it('excludes user email when anonymous');
  });
});

// TODO: test https://github.com/Fabricate-IO/expedition-quest-creator/issues/184
// We should see how to start a local msyql instance (and bigstore)
// and point the configs at it.
// (note: current travis environment variables are fillter values)

import {Feedback, FeedbackAttributes, FeedbackInstance} from './Feedback'
import {Quest, QuestAttributes, QuestInstance} from './Quests'
import * as Sequelize from 'sequelize'
import * as expect from 'expect'
import {} from 'jasmine'

describe('feedback', () => {
  let f: Feedback;
  let q: Quest;
  beforeEach((done: () => any) => {
    const s = new Sequelize({dialect: 'sqlite', storage: ':memory:'})

    q = new Quest(s);
    q.model.sync()
      .then(() => {
        return q.model.create({partition: 'testpartition', id: 'questid', ratingavg: 0, ratingcount: 0, email: 'author@test.com'});
      })
      .then(() => {
        f = new Feedback(s);
        f.associate({Quest: q});
        q.associate({Feedback: f});
        f.model.sync()
          .then(() => {done();})
          .catch((e: Error) => {throw e;});
      })
      .catch((e: Error) => {throw e;});
  });

  const testRatingData: FeedbackAttributes = {
    created: new Date(),
    partition: "testpartition",
    questid: "questid",
    userid: "userid",
    questversion: 1,
    rating: 4.0,
    text: "This is a rating!",
    email: "test@test.com",
    name: "Test Testerson",
    difficulty: "normal",
    platform: "ios",
    players: 5,
    version: "1.0.0",
  };

  it('fails to store feedback if no such quest exists', (done: ()=>any) => {
    const rating = {...testRatingData, questid: "nonexistantquest"};

    f.submit("rating", rating)
      .catch((e: Error) => {
        expect(e.message.toLowerCase()).toContain("no such quest");
        done();
      });
  });

  it('succeeds if performed on an existing quest', (done: ()=>any) => {
    f.submit("rating", testRatingData)
      .then(() => {
        return f.get("testpartition", "questid", "userid");
      })
      .then((result: FeedbackInstance) => {
        expect(result.dataValues).toEqual(testRatingData);
        done();
      });
  });

  it('succeeds if a rating was already given for the quest', (done: () => any) => {
    const rating2 = {...testRatingData, rating: 5.0};

    f.submit("rating", testRatingData)
      .then(() => {
        return f.submit("rating", rating2);
      })
      .then(() => {
        return f.get("testpartition", "questid", "userid");
      })
      .then((result: FeedbackInstance) => {
        expect(result.dataValues).toEqual(rating2);
        return q.get("testpartition", "questid");
      })
      .then((quest: QuestInstance) => {
        expect(quest.dataValues.ratingcount).toEqual(1);
        expect(quest.dataValues.ratingavg).toEqual(5);
        done();
      });
  });

  it('re-calculates quest rating avg and count on new feedback (only counting feedback with non-null ratings)', (done: () => any) => {
    const rating1 = {...testRatingData, rating: 3.0, userid: "1"};
    const rating2 = {...testRatingData, rating: 4.0, userid: "2"};
    const rating3 = {...testRatingData, rating: 1.0, userid: "3"};
    const ratingNull = {...testRatingData, rating: null, userid: "4"};
    f.submit("rating", rating1)
      .then(() => {return f.submit("rating", rating2);})
      .then(() => {return f.submit("rating", rating3);})
      .then(() => {return f.submit("rating", ratingNull);})
      .then(() => {
        return q.get("testpartition", "questid");
      })
      .then((quest: QuestInstance) => {
        expect(quest.dataValues.ratingcount).toEqual(3); // Null is not counted
        expect(quest.dataValues.ratingavg.toFixed(2)).toEqual(2.67);
        done();
      });
  });
});

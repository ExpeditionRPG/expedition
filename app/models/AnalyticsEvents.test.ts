import {AnalyticsEvent, AnalyticsEventAttributes, AnalyticsEventInstance} from './AnalyticsEvents'
import {Quest, QuestAttributes, QuestInstance} from './Quests'
import * as Sequelize from 'sequelize'
import * as expect from 'expect'

describe('AnalyticsEvent', () => {
  let ae: AnalyticsEvent;
  let q: Quest;

  const testData: AnalyticsEventAttributes = {
    category: 'category',
    action: 'action',
    created: new Date(),
    quest_id: 'questid',
    user_id: 'userid',
    quest_version: 1,
    difficulty: 'normal',
    platform: 'ios',
    players: 5,
    version: '1.0.0',
  };

  describe('submitAnalyticsEvent', () => {
    beforeEach((done: DoneFn) => {
      const s = new Sequelize({dialect: 'sqlite', storage: ':memory:'});
      q = new Quest(s);
      q.model.sync()
        .then(() => {
          return q.model.create({
            partition: 'testpartition', 
            id: 'questid', 
            ratingavg: 0, 
            ratingcount: 0, 
            email: 'author@test.com'
          });
        })
        .then(() => {
          ae = new AnalyticsEvent(s);
          ae.associate({Quest: q});
          ae.model.sync()
            .then(() => {done();})
            .catch((e: Error) => {throw e;});
        })
        .catch((e: Error) => {throw e;});
    });

    // TODO once we have / need event getting, get and confirm entry here
    it('created an entry', (done: DoneFn) => {
      ae.create(testData)
        .then(() => {
          done();
        });
    });
  });
});

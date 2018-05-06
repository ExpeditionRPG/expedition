import {AnalyticsEvent, AnalyticsEventInstance} from './AnalyticsEvents'
import {AnalyticsEvent as AnalyticsEventAttributes} from 'expedition-qdl/lib/schema/AnalyticsEvents'
import {Quest} from './Quests'

const Sequelize = require('sequelize');

export const testQuestEnd: AnalyticsEventAttributes = new AnalyticsEventAttributes({
  category: 'quest',
  action: 'end',
  created: new Date(),
  questID: 'questid',
  userID: 'userid',
  questVersion: 1,
  difficulty: 'NORMAL',
  platform: 'ios',
  players: 5,
  version: '1.0.0',
});

describe('AnalyticsEvent', () => {
  let ae: AnalyticsEvent;
  let q: Quest;

  const testData = new AnalyticsEventAttributes({
    category: 'category',
    action: 'action',
    created: new Date(),
    questID: 'questid',
    userID: 'userid',
    questVersion: 1,
    difficulty: 'NORMAL',
    platform: 'ios',
    players: 5,
    version: '1.0.0',
    json: '"test"',
  });

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
          return ae.model.sync();
        })
        .then(() => done())
        .catch(done.fail);
    });

    it('created an entry', (done: DoneFn) => {
      ae.create(testData)
        .then(() => {
          return ae.model.findOne({where: {userID: testData.userID}});
        }).then((m: AnalyticsEventInstance) => {
          expect(new AnalyticsEventAttributes(m.dataValues)).toEqual(testData);
          done();
        })
        .catch(done.fail);
    });
  });
});

import {AnalyticsEvent} from './AnalyticsEvents'
import {AnalyticsEvent as AnalyticsEventAttributes} from 'expedition-qdl/lib/schema/AnalyticsEvents'
import {User, UserAttributes, UserQuestsType} from './Users'

// TODO: Useful test constants should go in a "testdata" folder or similar
import {testQuestEnd} from './AnalyticsEvents.test'

const Moment = require('moment');
const Sequelize = require('sequelize');
const sinon = require('sinon');

describe('users', () => {
  let ae: AnalyticsEvent;
  let u: User;
  let mc: any;
  beforeEach((done: DoneFn) => {
    const s = new Sequelize({dialect: 'sqlite', storage: ':memory:'})
    mc = {post: sinon.spy()};
    ae = new AnalyticsEvent(s);
    ae.model.sync()
      .then(() => {
        u = new User(s, mc);
        return u.model.sync();
      })
      .then(() => {
        return u.associate({AnalyticsEvent: ae});
      })
      .then(() => done())
      .catch(done.fail);
  });

  const testUserData: UserAttributes = {
    id: 'test',
    email: 'test@test.com',
    name: 'Test Testerson',
    created: new Date(Date.now()),
    last_login: new Date(Date.now()),
    loot_points: 0,
  } as any; // TODO: remove this any assertion once we've split out quest_plays

  describe('upsert', () => {
    it('inserts user when none exists', (done: DoneFn) => {
      u.upsert(testUserData).then(() => {
        return u.get(testUserData.id);
      }).then((user: any) => {
        expect(user).toEqual(jasmine.objectContaining(testUserData));
        done();
      }).catch(done.fail);
    });

    it('subscribes to creators list if mailchimp configured', (done: DoneFn) => {
      u.upsert(testUserData).then(() => {
        expect(mc.post.calledWith(sinon.match.any, {
          email_address: testUserData.email,
          status: 'subscribed',
        })).toEqual(true);
        done();
      }).catch(done.fail);
    });
  });

  describe('userQuests', () => {
    it('returns valid results for players without quest history', (done: DoneFn) => {
      u.upsert(testUserData).then(() => {
        return u.get('test');
      })
      .then((user: any) => u.getQuests(testUserData.id))
      .then((result: UserQuestsType) => {
        expect(result).toEqual({});
        done();
      })
      .catch(done.fail);
    });


    it('returns valid results for players with quest history', (done: DoneFn) => {
      u.upsert(testUserData).then(() => {
        return ae.create(new AnalyticsEventAttributes({...testQuestEnd, userID: testUserData.id}));
      })
      .then((user: any) => u.getQuests(testUserData.id))
      .then((quests: UserQuestsType) => {
        expect(Object.keys(quests).length).toEqual(1);
        const result = quests[testQuestEnd.questID as string];
        expect(Moment(result.lastPlayed as any).isSame(testQuestEnd.created as any)).toEqual(true);
        done();
      }).catch(done.fail);
    });
  });
});

import {AnalyticsEvent} from './AnalyticsEvents'
import {User, UserAttributes} from './Users'
import * as Sequelize from 'sequelize'

import * as expect from 'expect'
import * as sinon from 'sinon'

describe('users', () => {
  let ae: AnalyticsEvent;
  let u: User;
  let mc: any;
  beforeEach((done: () => any) => {
    const s = new Sequelize({dialect: 'sqlite', storage: ':memory:'})
    mc = {post: sinon.spy()};
    ae = new AnalyticsEvent(s);
    ae.model.sync()
      .then(() => {
        u = new User(s, mc);
        u.model.sync()
          .then(() => {
            u.associate({AnalyticsEvent: ae});
          })
          .then(() => {done();})
          .catch((e: Error) => {throw e;});
      });
  });

  const testUserData: UserAttributes = {
    id: "test",
    email: "test@test.com",
    name: "Test Testerson",
    created: new Date(Date.now()),
    last_login: new Date(Date.now()),
    loot_points: 0,
  } as any; // TODO: remove this any assertion once we've split out quest_plays

  describe('upsert', () => {
    it('inserts user when none exists', (done: DoneFn) => {
      u.upsert(testUserData).then(() => {
        return u.get("test");
      }).then((user: any) => {
        expect(user).toContain(testUserData);
        done();
      }).catch((err: Error) => {
        throw err;
      });
    });

    it('subscribes to creators list if mailchimp configured', () => {
      u.upsert(testUserData);
      expect(mc.post.calledWith(sinon.match.any, {
        email_address: "test@test.com",
        status: 'subscribed',
      }));
    });
  });
});

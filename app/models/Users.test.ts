import {User, UserAttributes} from './Users'
import * as Sequelize from 'sequelize'

import * as expect from 'expect'
import * as sinon from 'sinon'
import {} from 'jasmine'

describe('users', () => {
  let u: User;
  let mc: any;
  beforeEach((done: () => any) => {
    const s = new Sequelize({dialect: 'sqlite', storage: ':memory:'})
    mc = {post: sinon.spy()};
    u = new User(s, mc);
    u.model.sync()
      .then(() => {done();})
      .catch((e: Error) => {throw e;});
  });

  const testUserData: UserAttributes = {
    id: "test",
    email: "test@test.com",
    name: "Test Testerson",
    created: new Date(Date.now()),
    lastLogin: new Date(Date.now()),
  };

  describe('upsert', () => {
    it('inserts user when none exists', (done: ()=>any) => {
      u.upsert(testUserData).then(() => {
        return u.get("test");
      }).then((user: any) => {
        expect(user.dataValues).toEqual(testUserData);
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

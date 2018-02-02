import * as expect from 'expect'
import {feedback} from './Handlers'
import * as sinon from 'sinon'
import {PUBLIC_PARTITION} from './models/Quests'
import {Feedback} from './models/Feedback'
import * as Sequelize from 'sequelize'
import { mockReq, mockRes } from 'sinon-express-mock'

describe('handlers', () => {
  describe('healthCheck', () => {
    it('returns success');
  });

  describe('announcement', () => {
    it('returns with message and link');
  });

  describe('search', () => {
    it('handles missing locals');
    it('successfully searches and returns data');
  });

  describe('questXMLRedirect', () => {
    it('redirects to quest XML url');
  });

  describe('publish', () => {
    it('handles missing locals');
    it('publishes minor release');
    it('publishes major release');
  });

  describe('unpublish', () => {
    it('unpublishes a quest');
    it('handles missing locals');
  });

  describe('feedback', () => {
    let f: Feedback;
    beforeEach((done: () => any) => {
      const s = new Sequelize({dialect: 'sqlite', storage: ':memory:'})
      f = new Feedback(s);
      f.model.sync()
        .then(() => {done();})
        .catch((e: Error) => {throw e;});
    });

    it('rejects non-parseable feedback', () => {
      const res = mockRes();
      feedback(f, mockReq({body: '{', params: {type: 'feedback'}}), res);
      expect(res.status.calledWith(400));
      expect(res.end.calledWith('Error reading request.'));
    });
    it('rejects invalid data', () => {
      const data = {
        partition: 'random-partition',
        questid: "123",
        userid: "456",
      }
      const res = mockRes();
      feedback(f, mockReq({body: JSON.stringify(data), params: {type: 'feedback'}}), res);
      expect(res.status.calledWith(400));
      expect(res.end.calledWith('Invalid request.'));
    });
    it('publishes with minimal data', () => {
      const data = {
        partition: PUBLIC_PARTITION,
        questid: "123",
        userid: "456",
      }
      const res = mockRes();
      feedback(f, mockReq({body: JSON.stringify(data), params: {type: 'feedback'}}), res);
      expect(res.end.calledWith('ok'));
    });
    it('publishes feedback', () => {
      const data = {
        partition: PUBLIC_PARTITION,
        questid: "123",
        userid: "456",
        questversion: 1,
        rating: 3,
        text: "pretty good test quest",
        email: "test@email.com",
        name: "Test Testerson",
        difficulty: "HARD",
        platform: "web",
        platformDump: "web USERAGENT TEST TEST",
        players: 4,
        version: "1.6.0",
      }
      const res = mockRes();
      feedback(f, mockReq({body: JSON.stringify(data), params: {type: 'feedback'}}), res);
      expect(res.end.calledWith('ok'));
    });
  });

  describe('subscribe', () => {
    it('handles invalid email address');
    it('subscribes user to list');
  });
});

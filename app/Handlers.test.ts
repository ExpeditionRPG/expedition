import {feedback} from './Handlers'
import {PUBLIC_PARTITION} from 'expedition-qdl/lib/schema/Constants'
import {Feedback} from './models/Feedback'
import {Quest} from './models/Quests'
import { mockReq, mockRes } from 'sinon-express-mock'
import {MailService} from './Mail'

const Sequelize = require('sequelize');
const sinon = require('sinon');

describe('handlers', () => {
  describe('healthCheck', () => {
    it('returns success');
  });

  describe('announcement', () => {
    it('returns with message and link');
    it('returns default version if unable to reach a version API');
    it('returns the latest version from API');
    it('caches valid version results');
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
    let q: Quest;
    let ms: MailService;

    beforeEach((done: () => any) => {
      const s = new Sequelize({dialect: 'sqlite', storage: ':memory:'})
      f = new Feedback(s);
      q = new Quest(s);

      f.model.sync()
        .then(() => {return q.model.sync()})
        .then(() => {f.associate({Quest: q}); done();})
        .catch((e: Error) => {throw e;});

      ms = {send: sinon.spy()};
    });

    it('rejects non-parseable feedback', (done: DoneFn) => {
      const res = mockRes();
      feedback(ms, f, mockReq({body: '{', params: {type: 'feedback'}}), res)
        .then(done.fail)
        .catch(() => {
          expect(res.status.calledWith(400)).toEqual(true);
          expect(res.end.calledWith('Error reading request.')).toEqual(true);
          done();
        }).catch(done.fail);
    });

    it('rejects invalid data', (done: DoneFn) => {
      const data = {
        partition: 'random-partition',
        questid: '123',
        userid: '456',
      }
      const res = mockRes();
      feedback(ms, f, mockReq({body: JSON.stringify(data), params: {type: 'feedback'}}), res)
        .then(done.fail)
        .catch(() => {
          expect(res.status.calledWith(400)).toEqual(true);
          console.log(res.end.getCalls());
          expect(res.end.calledWith('Invalid request.')).toEqual(true);
          done();
        }).catch(done.fail);
    });
    it('publishes with minimal data', (done: DoneFn) => {
      const data = {
        partition: PUBLIC_PARTITION,
        questid: '123',
        userid: '456',
      }
      const res = mockRes();
      feedback(ms, f, mockReq({body: JSON.stringify(data), params: {type: 'feedback'}}), res)
        .then(() => {
          expect(res.end.calledWith('ok')).toEqual(true);
          done();
        }).catch(done.fail);
    });
    it('publishes feedback', (done: DoneFn) => {
      const data = {
        partition: PUBLIC_PARTITION,
        questid: '123',
        userid: '456',
        questversion: 1,
        rating: 3,
        text: 'pretty good test quest',
        email: 'test@email.com',
        name: 'Test Testerson',
        difficulty: 'HARD',
        platform: 'web',
        platformDump: 'web USERAGENT TEST TEST',
        players: 4,
        version: '1.6.0',
      }
      const res = mockRes();
      feedback(ms, f, mockReq({body: JSON.stringify(data), params: {type: 'feedback'}}), res)
        .then(() => {
          expect(res.end.calledWith('ok')).toEqual(true);
          done();
        }).catch(done.fail);
    });
  });

  describe('subscribe', () => {
    it('handles invalid email address');
    it('subscribes user to list');
  });
});

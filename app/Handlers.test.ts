import { mockReq, mockRes } from 'sinon-express-mock'
import {MailService} from './Mail'
import {Database, QuestInstance, AnalyticsEventInstance} from './models/Database'
import {
  healthCheck,
  publish,
  feedback,
  unpublish,
  questXMLHandler,
  search,
  postAnalyticsEvent,
  userQuests,
  subscribe,
} from './Handlers'
import {
  testingDBWithState,
  quests as q,
  renderedQuests as rq,
  users as u,
  analyticsEvents as ae,
} from './models/TestData'

describe('handlers', () => {
  describe('healthCheck', () => {
    it('returns success', () => {
      const res = mockRes();
      healthCheck(mockReq({body: ''}), res);
      expect(res.end.calledWith(' ')).toEqual(true);
      expect(res.status.calledWith(200)).toEqual(true);
    });
  });

  describe('announcement', () => {
    it('returns with message and link');
    it('returns default version if unable to reach a version API');
    it('returns the latest version from API');
    it('caches valid version results');
  });

  describe('search', () => {
    it('handles missing locals');
    it('successfully searches and returns data', (done: DoneFn) => {
      const res = mockRes();
      testingDBWithState([q.basic])
        .then((db) => search(db, mockReq({body: '{}'}), res))
        .then(() => {
          expect(res.end.calledOnce).toEqual(true);
          expect(JSON.parse(res.end.getCall(0).args[0]).quests).toEqual([jasmine.objectContaining({id: q.basic.id})]);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('questXMLHandler', () => {
    it('returns quest XML', (done: DoneFn) => {
      const res = mockRes();
      testingDBWithState([q.basic, rq.basic])
        .then((db) => questXMLHandler(db, mockReq({body: '', params: {quest: q.basic.id}}), res))
        .then(() => {
          expect(res.end.calledWith(rq.basic.xml))
          done();
        })
        .catch(done.fail);
    });
    it('returns error when given invalid quest id');
  });

  describe('publish', () => {
    let ms: MailService;
    beforeEach(() => {
      ms = {send: jasmine.createSpy('send')};
    });

    it('handles missing locals');
    it('publishes minor release');
    it('publishes major release');
    it('sends mail to admin');
    it('sends mail to user on first publish');
    it('publishes new quest', (done: DoneFn) => {
      const res = mockRes();
      res.locals.id = u.basic.id;
      let db: Database;
      testingDBWithState([])
        .then((tdb) => {
          db = tdb;
          const query = {
            partition: q.basic.partition,
            title: q.basic.title,
            summary: q.basic.summary,
            author: q.basic.author,
            email: q.basic.email,
            minplayers: q.basic.minplayers,
            maxplayers: q.basic.maxplayers,
            mintimeminutes: q.basic.mintimeminutes,
            maxtimeminutes: q.basic.maxtimeminutes,
            genre: q.basic.genre,
            contentrating: q.basic.contentrating,
            expansionhorror: q.basic.expansionhorror,
            language: q.basic.language,
            majorRelease: true,
          };
          return publish(db, ms, mockReq({body: rq.basic.xml, query, params: {id: q.basic.id}}), res);
        })
        .then(() => {
          expect(res.status.calledWith(200)).toEqual(true);
          expect(res.end.calledWith(q.basic.id)).toEqual(true);
          return db.quests.findOne({where: {id: q.basic.id}});
        })
        .then((i: QuestInstance|null) => {
          if (i === null) {
            throw new Error('quest not found');
          }
          expect(i.get('title')).toEqual(q.basic.title);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('unpublish', () => {
    it('unpublishes a quest', (done: DoneFn) => {
      const res = mockRes();
      let db: Database;
      testingDBWithState([q.basic])
        .then((tdb) => {
          db = tdb;
          return unpublish(db, mockReq({body: '', params: {quest: q.basic.id}}), res);
        })
        .then(() => {
          expect(res.status.calledWith(200)).toEqual(true);
          expect(res.end.calledWith('ok')).toEqual(true);
          return db.quests.findOne({where: {id: q.basic.id}});
        })
        .then((i: QuestInstance|null) => {
          if (i === null) {
            throw new Error('quest not found');
          }
          expect(i.get('tombstone')).not.toBeNull();
          done();
        })
        .catch(done.fail);
    });
    it('handles missing locals');
  });

  describe('postAnalyticsEvent', () => {
    it('posts an event', (done: DoneFn) => {
      const res = mockRes();
      let db: Database;
      testingDBWithState([])
        .then((tdb) => {
          db = tdb;
          return postAnalyticsEvent(db, mockReq({
            params: {category: ae.action.category, action: ae.action.action},
            body: JSON.stringify({
              questid: ae.action.questID,
              userid: ae.action.userID,
              questversion: ae.action.questVersion,
              difficulty: ae.action.difficulty,
              platform: ae.action.platform,
              players: ae.action.players,
              version: ae.action.version,
              json: ae.action.json,
            }),
          }), res);
        })
        .then(() => db.analyticsEvent.findOne({where: {userID: ae.action.userID}}))
        .then((i: AnalyticsEventInstance|null) => {
          expect(res.status.calledWith(200)).toEqual(true);
          expect(i).not.toEqual(null);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('feedback', () => {
    let ms: MailService;
    beforeEach(() => {
      ms = {send: jasmine.createSpy('send')};
    });

    it('rejects non-parseable feedback', (done: DoneFn) => {
      const res = mockRes();
      testingDBWithState([])
        .then((db) => feedback(db, ms, mockReq({body: '{', params: {type: 'feedback'}}), res))
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
      testingDBWithState([q.basic])
        .then((db) => feedback(db, ms, mockReq({body: JSON.stringify(data), params: {type: 'feedback'}}), res))
        .then(done.fail)
        .catch(() => {
          expect(res.status.calledWith(400)).toEqual(true);
          expect(res.end.calledWith('Invalid request.')).toEqual(true);
          done();
        }).catch(done.fail);
    });
    it('publishes with minimal data', (done: DoneFn) => {
      const data = {
        partition: q.basic.partition,
        questid: q.basic.id,
        userid: '456',
      }
      const res = mockRes();
      testingDBWithState([q.basic])
        .then((db) => feedback(db, ms, mockReq({body: JSON.stringify(data), params: {type: 'feedback'}}), res))
        .then(() => {
          expect(res.end.calledWith('ok')).toEqual(true);
          done();
        }).catch(done.fail);
    });
    it('publishes feedback', (done: DoneFn) => {
      const data = {
        partition: q.basic.partition,
        questid: q.basic.id,
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
      testingDBWithState([q.basic])
        .then((db) => feedback(db, ms, mockReq({body: JSON.stringify(data), params: {type: 'feedback'}}), res))
        .then(() => {
          expect(res.end.calledWith('ok')).toEqual(true);
          done();
        }).catch(done.fail);
    });
  });

  describe('userQuests', () => {
    it('gets quest played by user', (done: DoneFn) => {
      const res = mockRes();
      res.locals.id = ae.questEnd.userID;
      testingDBWithState([ae.questEnd])
        .then((db) => userQuests(db, mockReq({}), res))
        .then(() => {
          expect(res.status.calledWith(200)).toEqual(true);
          expect(JSON.parse(res.end.getCall(0).args[0])).toEqual({[ae.questEnd.questID]: jasmine.any(Object)});
          done();
        }).catch(done.fail);
    });
  });

  describe('subscribe', () => {
    it('handles invalid email address');
    it('subscribes user to list', () => {
      const res = mockRes();
      let result: any;
      const mc = {post: (list: any, details: any, cb: any) => {
        result = {list, details};
        cb(null, null);
      }};
      const email = 'asdf@ghjk.com';
      subscribe(mc, 'testlist', mockReq({body: JSON.stringify({email})}), res);
      expect(result.list).toContain('testlist');
      expect(result.details).toEqual(jasmine.objectContaining({email_address: email}));
    });
  });
});

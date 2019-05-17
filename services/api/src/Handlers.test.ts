import { mockReq, mockRes } from 'sinon-express-mock';
import {
  feedback,
  healthCheck,
  loadQuestData,
  postAnalyticsEvent,
  publish,
  questXMLHandler,
  saveQuestData,
  search,
  subscribe,
  unpublish,
  userQuests,
} from './Handlers';
import { MailService } from './Mail';
import {
  AnalyticsEventInstance,
  Database,
  QuestInstance,
} from './models/Database';
import { getQuest } from './models/Quests';
import {
  analyticsEvents as ae,
  questData as qd,
  quests as q,
  renderedQuests as rq,
  testingDBWithState,
  users as u,
} from './models/TestData';

describe('handlers', () => {
  describe('healthCheck', () => {
    test('returns success', () => {
      const res = mockRes();
      healthCheck(mockReq({ body: '' }), res);
      expect(res.end.calledWith(' ')).toEqual(true);
      expect(res.status.getCall(0).args[0]).toEqual(200);
    });
  });

  describe('announcement', () => {
    test.skip('returns with message and link', () => {
      /* TODO */
    });
    test.skip('returns default version if unable to reach a version API', () => {
      /* TODO */
    });
    test.skip('returns the latest version from API', () => {
      /* TODO */
    });
    test.skip('caches valid version results', () => {
      /* TODO */
    });
  });

  describe('search', () => {
    test.skip('handles missing locals', () => {
      /* TODO */
    });
    test('successfully searches and returns data', (done: DoneFn) => {
      const res = mockRes();
      testingDBWithState([q.basic])
        .then(db => search(db, mockReq({ body: '{}' }), res))
        .then(() => {
          expect(res.end.calledOnce).toEqual(true);
          expect(JSON.parse(res.end.getCall(0).args[0]).quests).toEqual([
            jasmine.objectContaining({ id: q.basic.id }),
          ]);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('questXMLHandler', () => {
    test('returns quest XML', (done: DoneFn) => {
      const res = mockRes();
      testingDBWithState([q.basic, rq.basic])
        .then(db =>
          questXMLHandler(
            db,
            mockReq({ body: '', params: { quest: q.basic.id } }),
            res,
          ),
        )
        .then(() => {
          expect(res.end.calledWith(rq.basic.xml));
          done();
        })
        .catch(done.fail);
    });
    test.skip('returns error when given invalid quest id', () => {
      /* TODO */
    });
  });

  describe('publish', () => {
    let ms: MailService;
    beforeEach(() => {
      ms = { send: jasmine.createSpy('send') };
    });

    test.skip('handles missing locals', () => {
      /* TODO */
    });
    test.skip('publishes minor release', () => {
      /* TODO */
    });
    test.skip('publishes major release', () => {
      /* TODO */
    });
    test.skip('sends mail to admin', () => {
      /* TODO */
    });
    test.skip('sends mail to user on first publish', () => {
      /* TODO */
    });
    test('publishes new quest', (done: DoneFn) => {
      const res = mockRes();
      res.locals.id = u.basic.id;
      let db: Database;
      testingDBWithState([])
        .then(tdb => {
          db = tdb;
          const query = {
            author: q.basic.author,
            contentrating: q.basic.contentrating,
            email: q.basic.email,
            expansionhorror: q.basic.expansionhorror,
            expansionfuture: q.basic.expansionfuture,
            expansionscarredlands: q.basic.expansionscarredlands,
            genre: q.basic.genre,
            language: q.basic.language,
            majorRelease: true,
            maxplayers: q.basic.maxplayers,
            maxtimeminutes: q.basic.maxtimeminutes,
            minplayers: q.basic.minplayers,
            mintimeminutes: q.basic.mintimeminutes,
            partition: q.basic.partition,
            summary: q.basic.summary,
            title: q.basic.title,
          };
          return publish(
            db,
            ms,
            mockReq({ body: rq.basic.xml, query, params: { id: q.basic.id } }),
            res,
          );
        })
        .then(() => {
          expect(res.status.getCall(0).args[0]).toEqual(200);
          expect(res.end.calledWith(q.basic.id)).toEqual(true);
          return db.quests.findOne({ where: { id: q.basic.id } });
        })
        .then((i: QuestInstance | null) => {
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
    test('unpublishes a quest', (done: DoneFn) => {
      const res = mockRes();
      let db: Database;
      testingDBWithState([q.basic])
        .then(tdb => {
          db = tdb;
          return unpublish(
            db,
            mockReq({ body: '', params: { quest: q.basic.id } }),
            res,
          );
        })
        .then(() => {
          expect(res.status.getCall(0).args[0]).toEqual(200);
          expect(res.end.calledWith('ok')).toEqual(true);
          return db.quests.findOne({ where: { id: q.basic.id } });
        })
        .then((i: QuestInstance | null) => {
          if (i === null) {
            throw new Error('quest not found');
          }
          expect(i.get('tombstone')).not.toBeNull();
          done();
        })
        .catch(done.fail);
    });
    test.skip('handles missing locals', () => {
      /* TODO */
    });
  });

  describe('postAnalyticsEvent', () => {
    test('posts an event', (done: DoneFn) => {
      const res = mockRes();
      let db: Database;
      testingDBWithState([])
        .then(tdb => {
          db = tdb;
          return postAnalyticsEvent(
            db,
            mockReq({
              body: JSON.stringify({
                difficulty: ae.action.difficulty,
                json: ae.action.json,
                platform: ae.action.platform,
                players: ae.action.players,
                questid: ae.action.questID,
                questversion: ae.action.questVersion,
                userid: ae.action.userID,
                version: ae.action.version,
              }),
              params: {
                category: ae.action.category,
                action: ae.action.action,
              },
            }),
            res,
          );
        })
        .then(() =>
          db.analyticsEvent.findOne({ where: { userID: ae.action.userID } }),
        )
        .then((i: AnalyticsEventInstance | null) => {
          expect(res.status.getCall(0).args[0]).toEqual(200);
          expect(i).not.toEqual(null);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('feedback', () => {
    let ms: MailService;
    beforeEach(() => {
      ms = { send: jasmine.createSpy('send') };
    });

    test('rejects non-parseable feedback', (done: DoneFn) => {
      const res = mockRes();
      testingDBWithState([])
        .then(db =>
          feedback(
            db,
            ms,
            mockReq({ body: '{', params: { type: 'feedback' } }),
            res,
          ),
        )
        .then(done.fail)
        .catch(() => {
          expect(res.status.getCall(0).args[0]).toEqual(400);
          expect(res.end.calledWith('Error reading request.')).toEqual(true);
          done();
        })
        .catch(done.fail);
    });

    test('rejects invalid data', (done: DoneFn) => {
      const data = {
        partition: 'random-partition',
        questid: '123',
        userid: '456',
      };
      const res = mockRes();
      testingDBWithState([q.basic])
        .then(db =>
          feedback(
            db,
            ms,
            mockReq({
              body: JSON.stringify(data),
              params: { type: 'feedback' },
            }),
            res,
          ),
        )
        .then(done.fail)
        .catch(() => {
          expect(res.status.getCall(0).args[0]).toEqual(400);
          expect(res.end.calledWith('Invalid request.')).toEqual(true);
          done();
        })
        .catch(done.fail);
    });
    test('publishes with minimal data', (done: DoneFn) => {
      const data = {
        partition: q.basic.partition,
        questid: q.basic.id,
        userid: '456',
      };
      const res = mockRes();
      testingDBWithState([q.basic])
        .then(db =>
          feedback(
            db,
            ms,
            mockReq({
              body: JSON.stringify(data),
              params: { type: 'feedback' },
            }),
            res,
          ),
        )
        .then(() => {
          expect(res.end.calledWith('ok')).toEqual(true);
          done();
        })
        .catch(done.fail);
    });
    test('publishes rating feedback', (done: DoneFn) => {
      const data = {
        difficulty: 'HARD',
        email: 'test@email.com',
        name: 'Test Testerson',
        partition: q.basic.partition,
        platform: 'web',
        platformDump: 'web USERAGENT TEST TEST',
        players: 4,
        questid: q.basic.id,
        questline: 321,
        questversion: 1,
        rating: 3,
        text: 'pretty good test quest',
        userid: '456',
        version: '1.6.0',
      };
      const res = mockRes();
      let db: any;
      testingDBWithState([q.basic])
        .then(tdb => {
          db = tdb;
          return feedback(
            db,
            ms,
            mockReq({ body: JSON.stringify(data), params: { type: 'rating' } }),
            res,
          );
        })
        .then(() => {
          expect(res.end.calledWith('ok')).toEqual(true);
          return getQuest(db, q.basic.partition, q.basic.id);
        })
        .then(r => {
          expect(r.ratingcount).toEqual(1);
          expect(r.ratingavg).toEqual(3);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('userQuests', () => {
    test('gets quest played by user', (done: DoneFn) => {
      const res = mockRes();
      res.locals.id = ae.questEnd.userID;
      testingDBWithState([ae.questEnd, q.basic])
        .then(db => userQuests(db, mockReq({}), res))
        .then(() => {
          expect(res.status.getCall(0).args[0]).toEqual(200);
          expect(JSON.parse(res.end.getCall(0).args[0])).toEqual({
            [ae.questEnd.questID]: jasmine.any(Object),
          });
          done();
        })
        .catch(done.fail);
    });
  });

  describe('loadQuestData', () => {
    test('loads most recent quest', done => {
      const res = mockRes();
      res.locals.id = qd.basic.userid;
      testingDBWithState([qd.basic, qd.older])
        .then(db =>
          loadQuestData(
            db,
            mockReq({
              params: { quest: qd.basic.id, edittime: qd.basic.edittime },
            }),
            res,
          ),
        )
        .then(() => {
          expect(res.status.getCall(0).args[0]).toEqual(200);
          expect(JSON.parse(res.end.getCall(0).args[0])).toEqual({
            data: qd.basic.data,
            notes: qd.basic.notes,
            metadata: JSON.parse(qd.basic.metadata),
          });
          done();
        })
        .catch(done.fail);
    });
    test('returns 404 when quest not found', done => {
      const res = mockRes();
      res.locals.id = qd.basic.userid;
      testingDBWithState([])
        .then(db =>
          loadQuestData(
            db,
            mockReq({
              params: { quest: qd.basic.id, edittime: qd.basic.edittime },
            }),
            res,
          ),
        )
        .then(() => {
          expect(res.status.getCall(0).args[0]).toEqual(404);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('saveQuestData', () => {
    test('notifies when other client is editing quest', done => {
      const res = mockRes();
      res.locals.id = qd.basic.userid;
      testingDBWithState([qd.basic])
        .then(db =>
          saveQuestData(
            db,
            mockReq({
              params: { id: qd.basic.id },
              body: JSON.stringify({
                data: 'test data',
                notes: 'test notes',
                metadata: '{a: 5}',
                edittime: new Date(qd.basic.edittime.getTime() + 100),
              }),
            }),
            res,
          ),
        )
        .then(() => {
          expect(res.status.getCall(0).args[0]).toEqual(409);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('subscribe', () => {
    test.skip('handles invalid email address', () => {
      /* TODO */
    });
    test('subscribes user to list', () => {
      const res = mockRes();
      let result: any;
      const mc = {
        post: (list: any, details: any, cb: any) => {
          result = { list, details };
          cb(null, null);
        },
      };
      const email = 'asdf@ghjk.com';
      subscribe(
        mc,
        'testlist',
        mockReq({ body: JSON.stringify({ email }) }),
        res,
      );
      expect(result.list).toContain('testlist');
      expect(result.details).toEqual(
        jasmine.objectContaining({ email_address: email }),
      );
    });
  });
});

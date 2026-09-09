import Config from './config';
import { Quest } from 'shared/schema/Quests';
import * as request from 'request-promise';
jest.mock('request-promise', () => jest.fn());
import { mockReq, mockRes } from 'sinon-express-mock';
import { Partition } from 'shared/schema/Constants';
import {
  announcement,
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
import { prepare } from './models/Schema';
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
    test('returns with message and link', async () => {
      jest
        .spyOn(Config, 'get')
        .mockImplementation(
          (key: string) =>
            ({ ANNOUNCEMENT_LINK: '/news', ANNOUNCEMENT_MESSAGE: 'Hello' })[
              key
            ],
        );
      (request as any).mockResolvedValue('{}');
      const res = mockRes();
      await announcement(mockReq(), res);
      expect(res.json.firstCall.args[0]).toMatchObject({
        link: '/news',
        message: 'Hello',
      });
    });
    test('returns default version if unable to reach a version API', async () => {
      jest.useFakeTimers({ doNotFake: ['setImmediate', 'nextTick'] });
      jest.setSystemTime(new Date('2030-01-02'));
      (request as any).mockRejectedValue(new Error('offline'));
      const res = mockRes();
      await announcement(mockReq(), res);
      expect(res.json.firstCall.args[0].versions).toEqual({
        android: '1.0.0',
        ios: '1.0.0',
        web: '1.0.0',
      });
      jest.useRealTimers();
    });
    test('returns the latest version from API', async () => {
      jest.useFakeTimers({ doNotFake: ['setImmediate', 'nextTick'] });
      jest.setSystemTime(new Date('2030-01-03'));
      (request as any).mockImplementation((url: string) =>
        Promise.resolve(
          url.includes('play.google')
            ? '<div>Version 2.0.1</div>'
            : url.includes('itunes')
              ? '{"results":[{"version":"3.0.0"}]}'
              : '{"version":"4.0.0"}',
        ),
      );
      const res = mockRes();
      await announcement(mockReq(), res);
      expect(res.json.firstCall.args[0].versions).toEqual({
        android: '2.0.1',
        ios: '3.0.0',
        web: '4.0.0',
      });
      jest.useRealTimers();
    });
    test('caches valid version results', async () => {
      jest.useFakeTimers({ doNotFake: ['setImmediate', 'nextTick'] });
      jest.setSystemTime(new Date('2030-01-04'));
      (request as any)
        .mockClear()
        .mockResolvedValue(
          '{"version":"2.0.0","results":[{"version":"2.0.0"}]}',
        );
      const res = mockRes();
      await announcement(mockReq(), res);
      await announcement(mockReq(), res);
      expect(request).toHaveBeenCalledTimes(3);
      jest.useRealTimers();
    });
  });

  describe('search', () => {
    test('handles missing locals', async () => {
      const db = await testingDBWithState([q.basic]);
      const res = mockRes();
      res.locals = {};
      await search(db, mockReq({ body: '{}' }), res);
      expect(res.status.calledWith(200)).toBe(true);
    });
    test('successfully searches and returns data', (done: DoneFn) => {
      const res = mockRes();
      testingDBWithState([q.basic])
        .then(db => search(db, mockReq({ body: '{}' }), res))
        .then(() => {
          expect(res.end.calledOnce).toEqual(true);
          expect(JSON.parse(res.end.getCall(0).args[0]).quests).toEqual([
            expect.objectContaining({ id: q.basic.id }),
          ]);
          done();
        })
        .catch(done);
    });

    // The app sends showPrivate: true by default (reducers/Search
    // initialSearch), and POST /quests is unauthenticated. Passing the
    // undefined res.locals.id straight into the query made sequelize throw
    // `WHERE parameter "userid" has invalid "undefined" value`, which the
    // handler reported as a 500 -- so a logged-out player's default search
    // failed outright. Falling back to the public partition is the answer the
    // client is asking for: there are no private quests of "mine" to add.
    test('showPrivate without a session returns public quests, not a 500', (done: DoneFn) => {
      const res = mockRes();
      testingDBWithState([q.basic, q.private])
        .then(db => search(db, mockReq({ body: '{"showPrivate":true}' }), res))
        .then(() => {
          expect(res.status.getCall(0).args[0]).toEqual(200);
          const body = JSON.parse(res.end.getCall(0).args[0]);
          expect(body.error).toEqual(null);
          expect(body.quests).toEqual([
            expect.objectContaining({ id: q.basic.id }),
          ]);
          done();
        })
        .catch(done);
    });

    test('showPrivate with a session still returns the private quests it owns', (done: DoneFn) => {
      const res = mockRes();
      res.locals = { id: q.private.userid };
      testingDBWithState([q.basic, q.private])
        .then(db => search(db, mockReq({ body: '{"showPrivate":true}' }), res))
        .then(() => {
          expect(res.status.getCall(0).args[0]).toEqual(200);
          const partitions = JSON.parse(res.end.getCall(0).args[0]).quests.map(
            (quest: { partition: string }) => quest.partition,
          );
          expect(partitions).toContain(Partition.expeditionPrivate);
          expect(partitions).toContain(Partition.expeditionPublic);
          done();
        })
        .catch(done);
    });

    // A row whose stored values no longer satisfy the schema (an out-of-enum
    // genre, say) is dropped from the results. That is the right call, but it
    // used to happen in total silence, and the "Found N quests" line printed
    // the pre-filter count -- so a quest disappearing from search left no
    // trace at all.
    test('logs quests dropped by validation and counts only what it returns', (done: DoneFn) => {
      const res = mockRes();
      const errors: string[] = [];
      const logs: string[] = [];
      const errorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation((...args: unknown[]) =>
          errors.push(args.map(String).join(' ')),
        );
      const logSpy = jest
        .spyOn(console, 'log')
        .mockImplementation((...args: unknown[]) =>
          logs.push(args.map(String).join(' ')),
        );
      testingDBWithState([q.basic])
        .then(db =>
          db.quests
            .create({
              ...prepare(q.basic),
              genre: 'Adventure', // not a member of the Genre enum
              id: 'questidbadgenre',
            })
            .then(() => search(db, mockReq({ body: '{}' }), res)),
        )
        .then(() => {
          const body = JSON.parse(res.end.getCall(0).args[0]);
          // Still filtered out -- that behaviour is unchanged.
          expect(body.quests).toEqual([
            expect.objectContaining({ id: q.basic.id }),
          ]);
          // ...but now it says so, naming the row and the reason.
          expect(
            errors.filter(
              e => e.includes('questidbadgenre') && e.includes('genre'),
            ).length,
          ).toEqual(1);
          // ...and the count is what was actually returned, not what matched.
          expect(logs.some(l => l.includes('Found 1 quests'))).toEqual(true);
          expect(
            logs.some(l => l.includes('1 of 2 matching rows dropped')),
          ).toEqual(true);
          done();
        })
        .catch(done)
        .then(() => {
          errorSpy.mockRestore();
          logSpy.mockRestore();
        });
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
        .catch(done);
    });
    test('returns error when given invalid quest id', async () => {
      const db = await testingDBWithState([]);
      const res = mockRes();
      await questXMLHandler(
        db,
        mockReq({
          params: {
            quest: 'missing',
            partition: q.basic.partition,
            version: '1',
          },
        }),
        res,
      );
      expect(res.status.calledWith(500)).toBe(true);
    });
  });

  describe('publish', () => {
    let ms: MailService;
    beforeEach(() => {
      ms = { send: jest.fn() };
    });

    test('handles missing locals', async () => {
      const db = await testingDBWithState([
        u.basic,
        new Quest({ ...q.basic, userid: u.basic.id }),
      ]);
      const res = mockRes();
      res.locals.id = u.basic.id;
      const query: any = {};
      for (const key of [
        'author',
        'contentrating',
        'email',
        'genre',
        'language',
        'maxplayers',
        'maxtimeminutes',
        'minplayers',
        'mintimeminutes',
        'partition',
        'summary',
        'title',
      ]) {
        query[key] = String((q.basic as any)[key]);
      }
      res.locals = {};
      await publish(
        db,
        ms,
        mockReq({ body: rq.basic.xml, query, params: { id: q.basic.id } }),
        res,
      );
      expect(res.status.calledWith(500)).toBe(true);
    });
    test('publishes minor release', async () => {
      const db = await testingDBWithState([
        u.basic,
        new Quest({ ...q.basic, userid: u.basic.id }),
      ]);
      const res = mockRes();
      res.locals.id = u.basic.id;
      const query: any = {};
      for (const key of [
        'author',
        'contentrating',
        'email',
        'genre',
        'language',
        'maxplayers',
        'maxtimeminutes',
        'minplayers',
        'mintimeminutes',
        'partition',
        'summary',
        'title',
      ]) {
        query[key] = String((q.basic as any)[key]);
      }
      query.majorRelease = 'false';
      await publish(
        db,
        ms,
        mockReq({ body: rq.basic.xml, query, params: { id: q.basic.id } }),
        res,
      );
      const row = await db.quests.findOne();
      expect(res.status.calledWith(200)).toBe(true);
      expect(row!.get('questversion')).toBe(2);
      expect(row!.get('questversionlastmajor')).toBe(1);
    });
    test('publishes major release', async () => {
      const db = await testingDBWithState([
        u.basic,
        new Quest({ ...q.basic, userid: u.basic.id }),
      ]);
      const res = mockRes();
      res.locals.id = u.basic.id;
      const query: any = {};
      for (const key of [
        'author',
        'contentrating',
        'email',
        'genre',
        'language',
        'maxplayers',
        'maxtimeminutes',
        'minplayers',
        'mintimeminutes',
        'partition',
        'summary',
        'title',
      ]) {
        query[key] = String((q.basic as any)[key]);
      }
      query.majorRelease = 'true';
      await publish(
        db,
        ms,
        mockReq({ body: rq.basic.xml, query, params: { id: q.basic.id } }),
        res,
      );
      const row = await db.quests.findOne();
      expect(res.status.calledWith(200)).toBe(true);
      expect(row!.get('questversionlastmajor')).toBe(2);
    });
    test('sends mail to admin', async () => {
      const db = await testingDBWithState([
        u.basic,
        new Quest({ ...q.basic, userid: u.basic.id }),
      ]);
      const res = mockRes();
      res.locals.id = u.basic.id;
      const query: any = {};
      for (const key of [
        'author',
        'contentrating',
        'email',
        'genre',
        'language',
        'maxplayers',
        'maxtimeminutes',
        'minplayers',
        'mintimeminutes',
        'partition',
        'summary',
        'title',
      ]) {
        query[key] = String((q.basic as any)[key]);
      }
      await db.quests.destroy({ where: {} });
      await publish(
        db,
        ms,
        mockReq({ body: rq.basic.xml, query, params: { id: q.basic.id } }),
        res,
      );
      expect(ms.send).toHaveBeenCalledWith(
        ['team+newquest@fabricate.io'],
        expect.stringContaining(q.basic.title),
        expect.stringContaining(q.basic.summary),
      );
    });
    test('sends mail to user on first publish', async () => {
      const db = await testingDBWithState([
        u.basic,
        new Quest({ ...q.basic, userid: u.basic.id }),
      ]);
      const res = mockRes();
      res.locals.id = u.basic.id;
      const query: any = {};
      for (const key of [
        'author',
        'contentrating',
        'email',
        'genre',
        'language',
        'maxplayers',
        'maxtimeminutes',
        'minplayers',
        'mintimeminutes',
        'partition',
        'summary',
        'title',
      ]) {
        query[key] = String((q.basic as any)[key]);
      }
      await db.quests.destroy({ where: {} });
      await publish(
        db,
        ms,
        mockReq({ body: rq.basic.xml, query, params: { id: q.basic.id } }),
        res,
      );
      await new Promise(resolve => setTimeout(resolve, 25));
      expect(ms.send).toHaveBeenCalledWith(
        expect.arrayContaining([q.basic.email]),
        expect.any(String),
        expect.stringContaining('Congratulations'),
      );
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
            expansionwyrmsgiants: q.basic.expansionwyrmsgiants,
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
        .catch(done);
    });
  });

  describe('unpublish', () => {
    test('unpublishes a quest', (done: DoneFn) => {
      const res = mockRes();
      res.locals.id = q.basic.userid;
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
        .catch(done);
    });
    test('handles missing locals', async () => {
      const res = mockRes();
      res.locals = {};
      await unpublish(
        {} as any,
        mockReq({ params: { quest: q.basic.id } }),
        res,
      );
      expect(res.status.calledWith(401)).toBe(true);
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
        .catch(done);
    });
  });

  describe('feedback', () => {
    let ms: MailService;
    beforeEach(() => {
      ms = { send: jest.fn() };
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
        .then(() => done(new Error('expected the promise to reject')))
        .catch(() => {
          expect(res.status.getCall(0).args[0]).toEqual(400);
          expect(res.end.calledWith('Error reading request.')).toEqual(true);
          done();
        })
        .catch(done);
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
        .then(() => done(new Error('expected the promise to reject')))
        .catch(() => {
          expect(res.status.getCall(0).args[0]).toEqual(400);
          expect(res.end.calledWith('Invalid request.')).toEqual(true);
          done();
        })
        .catch(done);
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
        .catch(done);
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
        .catch(done);
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
            [ae.questEnd.questID]: expect.any(Object),
          });
          done();
        })
        .catch(done);
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
        .catch(done);
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
        .catch(done);
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
        .catch(done);
    });
  });

  describe('subscribe', () => {
    test('handles invalid email address', async () => {
      const mc = { post: jest.fn() };
      for (const email of ['bad-address', '', undefined]) {
        const res = mockRes();
        subscribe(
          mc,
          'list',
          mockReq({ body: JSON.stringify({ email }) }),
          res,
        );
        expect(res.status.calledWith(400)).toBe(true);
      }
      expect(mc.post).not.toHaveBeenCalled();
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
        expect.objectContaining({ email_address: email }),
      );
    });
  });
});

test('unpublish rejects another author without changing quest visibility', async () => {
  const db = await testingDBWithState([q.basic]);
  const res = mockRes();
  res.locals.id = 'other-author';
  await unpublish(db, mockReq({ params: { quest: q.basic.id } }), res);
  expect(res.status.calledWith(403)).toBe(true);
  expect((await db.quests.findOne())!.get('tombstone')).toBeNull();
  await db.sequelize.close();
});

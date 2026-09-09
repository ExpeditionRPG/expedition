import { Feedback } from 'shared/schema/Feedback';
import { object } from 'joi';
import { Expansion, Partition } from 'shared/schema/Constants';
import { Quest } from 'shared/schema/Quests';
import { MailService } from '../Mail';
import { QuestInstance } from './Database';
import {
  getQuest,
  unpublishQuest,
  republishQuest,
  publishQuest,
  searchQuests,
  updateQuestRatings,
} from './Quests';
import {
  feedback as f,
  quests as q,
  testingDBWithState,
  users as u,
} from './TestData';

const Moment = require('moment');

describe('quest', () => {
  let ms: MailService;
  beforeEach(() => {
    ms = { send: (e: string[], s: string, m: string) => Promise.resolve() };
  });

  describe('searchQuests', () => {
    const quests = [
      q.basic,
      q.private,
      q.privateUser2,
      q.horror,
      q.future,
      q.wyrmsgiants,
      q.scarredlands,
    ];

    test('returns an empty array if no results', done => {
      testingDBWithState(quests)
        .then(tdb => {
          return searchQuests(tdb, q.basic.userid, {
            partition: 'otherpartition',
          });
        })
        .then(results => {
          expect(results.length).toEqual(0);
          done();
        })
        .catch(done);
    });

    test('returns full quest data', done => {
      testingDBWithState(quests)
        .then(tdb => {
          return searchQuests(tdb, q.basic.userid, {
            partition: Partition.expeditionPublic,
          });
        })
        .then(results => {
          expect(results.length).toEqual(1);
          const resolved = new Quest(results[0].dataValues);
          for (const k of Object.keys(q.basic.optionsMap)) {
            expect((resolved as any)[k]).toEqual((q.basic as any)[k]);
          }
          done();
        })
        .catch(done);
    });

    test('matches title', done => {
      testingDBWithState(quests)
        .then(tdb => {
          return searchQuests(tdb, q.basic.userid, {
            partition: Partition.expeditionPublic,
            text: 'Future',
            expansions: [Expansion.horror, Expansion.future],
          });
        })
        .then(results => {
          expect(results.length).toEqual(1);
          expect((results[0] as any).dataValues).toEqual(
            expect.objectContaining({ id: q.future.id }),
          );
          done();
        })
        .catch(done);
    });

    test('matches author', done => {
      testingDBWithState(quests)
        .then(tdb => {
          return searchQuests(tdb, q.basic.userid, {
            partition: Partition.expeditionPublic,
            text: 'horrorauthor',
            expansions: [Expansion.horror, Expansion.future],
          });
        })
        .then(results => {
          expect(results.length).toEqual(1);
          expect((results[0] as any).dataValues).toEqual(
            expect.objectContaining({ id: q.horror.id }),
          );
          done();
        })
        .catch(done);
    });

    test('does not return expansions if unspecified', done => {
      testingDBWithState(quests)
        .then(tdb => {
          return searchQuests(tdb, q.basic.userid, {
            partition: Partition.expeditionPublic,
          });
        })
        .then(results => {
          expect(results.length).toEqual(1);
          expect((results[0] as any).dataValues).toEqual(
            expect.objectContaining({ id: 'questid' }),
          );
          done();
        })
        .catch(done);
    });

    test('returns expansion quests first if specified', done => {
      testingDBWithState(quests)
        .then(tdb =>
          searchQuests(tdb, '', {
            partition: Partition.expeditionPublic,
            expansions: [Expansion.horror],
          }),
        )
        .then(results => {
          expect(results.length).toEqual(2);
          expect((results[0] as any).dataValues).toEqual(
            expect.objectContaining({ id: 'questidhorror' }),
          );
          done();
        })
        .catch(done);
    });

    test('returns more compatible expansion quests first', done => {
      testingDBWithState(quests)
        .then(tdb =>
          searchQuests(tdb, '', {
            partition: Partition.expeditionPublic,
            expansions: [
              Expansion.horror,
              Expansion.future,
              Expansion.scarredlands,
              Expansion.wyrmsgiants,
            ],
          }),
        )
        .then(results => {
          expect(results.length).toEqual(5);
          expect(results.map(r => r.dataValues.id)).toEqual([
            'questidwyrmsgiantsscarred',
            'questidscarredlands',
            'questidfuture',
            'questidhorror',
            'questid',
          ]);
          done();
        })
        .catch(done);
    });

    test('return private quests (alongside public quests) when showPrivate is set to true', done => {
      testingDBWithState([q.basic, q.private])
        .then(tdb => {
          return searchQuests(tdb, q.basic.userid, {
            partition: Partition.expeditionPublic,
            showPrivate: true,
          });
        })
        .then(results => {
          expect(results.length).toEqual(2);
          expect((results[0] as any).dataValues).toEqual(
            expect.objectContaining({
              partition: Partition.expeditionPrivate,
            }),
          );
          expect((results[1] as any).dataValues).toEqual(
            expect.objectContaining({ partition: Partition.expeditionPublic }),
          );
          done();
        })
        .catch(done);
    });

    test('return private quests before public quests when showPrivate is set to true', done => {
      testingDBWithState([q.basic, q.private])
        .then(tdb => {
          return searchQuests(tdb, q.basic.userid, {
            partition: Partition.expeditionPublic,
            showPrivate: true,
          });
        })
        .then(results => {
          expect(results[0].dataValues).toEqual(
            expect.objectContaining({
              partition: Partition.expeditionPrivate,
            }),
          );
          expect(results[1].dataValues).toEqual(
            expect.objectContaining({ partition: Partition.expeditionPublic }),
          );
          done();
        })
        .catch(done);
    });

    test('does not return private quests when showPrivate is set to false', done => {
      testingDBWithState(quests)
        .then(tdb => {
          return searchQuests(tdb, q.basic.userid, {
            partition: Partition.expeditionPublic,
            showPrivate: false,
          });
        })
        .then(results => {
          expect(results.length).toEqual(1);
          Object.keys(results[0]).forEach(key => {
            if (
              Object.prototype.hasOwnProperty.call(results[0][key], 'partition')
            ) {
              expect(results[0][key].partition).toEqual(
                Partition.expeditionPublic,
              );
            }
          });
          done();
        })
        .catch(done);
    });

    test('returns only official quests when showOfficial is set to true', done => {
      testingDBWithState(quests)
        .then(tdb => {
          return searchQuests(tdb, q.basic.userid, {
            partition: Partition.expeditionPublic,
            showOfficial: true,
          });
        })
        .then(results => {
          for (const r of results) {
            expect(r.dataValues).toEqual(
              expect.objectContaining({ official: true }),
            );
          }
          done();
        })
        .catch(done);
    });

    test('returns only private quests belonging to provided user', done => {
      testingDBWithState(quests)
        .then(tdb => {
          return searchQuests(tdb, q.basic.userid, {
            partition: Partition.expeditionPublic,
            showPrivate: true,
            // https://github.com/ExpeditionRPG/expedition/issues/724
            // "text" adds an extra Or condition which could stomp privacy of query if there is a regression
            text: 'Quest',
          });
        })
        .then(results => {
          for (const r of results) {
            expect(r.dataValues).toEqual(
              expect.objectContaining({ userid: q.basic.userid }),
            );
          }
          done();
        })
        .catch(done);
    });

    test('+ratingavg (default) orders by newly published & little-rated, rating, then rating count', done => {
      const q1 = new Quest({
        ...q.basic,
        id: 'q1',
        ratingavg: 4.0,
        ratingcount: 10,
        created: Moment().subtract(1, 'month').toDate(),
      });
      const q2 = new Quest({
        ...q.basic,
        id: 'q2',
        ratingavg: 5.0,
        ratingcount: 6,
        created: Moment().subtract(1, 'month').toDate(),
      });
      const q3 = new Quest({
        ...q.basic,
        id: 'q3',
        ratingavg: 5.0,
        ratingcount: 8,
        created: Moment().subtract(1, 'month').toDate(),
      });
      const q4 = new Quest({
        ...q.basic,
        id: 'q4',
        ratingavg: 4.5,
        ratingcount: 4,
        created: Moment().subtract(6, 'days').toDate(),
      });

      testingDBWithState([q1, q2, q3, q4])
        .then(tdb => searchQuests(tdb, '', { order: '+ratingavg' }))
        .then(results => {
          expect(results.map(r => r.get('id'))).toEqual([
            'q4',
            'q3',
            'q2',
            'q1',
          ]);
          done();
        })
        .catch(done);
    });

    test('+ratingavg orders new quests with <5 ratings before quests with high rating count', done => {
      const q1 = new Quest({
        ...q.basic,
        id: 'q1',
        ratingavg: 4.0,
        ratingcount: 10,
        created: Moment().subtract(1, 'month').toDate(),
      });
      const q2 = new Quest({
        ...q.basic,
        id: 'q2',
        ratingavg: 4.0,
        ratingcount: 2,
        created: Moment().subtract(1, 'day').toDate(),
      });

      testingDBWithState([q1, q2])
        .then(tdb => searchQuests(tdb, '', { order: '+ratingavg' }))
        .then(results => {
          expect(results.map(r => r.get('id'))).toEqual(['q2', 'q1']);
          done();
        })
        .catch(done);
    });

    test('+ratingavg orders null ratings/counts last', done => {
      const q1 = new Quest({
        ...q.basic,
        id: 'q1',
        ratingavg: null,
        ratingcount: null,
        created: Moment().subtract(1, 'month').toDate(),
      });
      const q2 = new Quest({
        ...q.basic,
        id: 'q2',
        ratingavg: 4.0,
        ratingcount: 2,
        created: Moment().subtract(1, 'day').toDate(),
      });

      testingDBWithState([q1, q2])
        .then(tdb => searchQuests(tdb, '', { order: '+ratingavg' }))
        .then(results => {
          expect(results.map(r => r.get('id'))).toEqual(['q2', 'q1']);
          done();
        })
        .catch(done);
    });

    test('+ratingavg orders old quests with few ratings after quests with high rating count', done => {
      const q1 = new Quest({
        ...q.basic,
        id: 'q1',
        ratingavg: 4.0,
        ratingcount: 10,
        created: Moment().subtract(1, 'month').toDate(),
      });
      const q2 = new Quest({
        ...q.basic,
        id: 'q2',
        ratingavg: 4.0,
        ratingcount: 2,
        created: Moment().subtract(1, 'month').toDate(),
      });

      testingDBWithState([q1, q2])
        .then(tdb => searchQuests(tdb, '', { order: '+ratingavg' }))
        .then(results => {
          expect(results.map(r => r.get('id'))).toEqual(['q1', 'q2']);
          done();
        })
        .catch(done);
    });

    test('age filter works', done => {
      const q1 = new Quest({
        ...q.basic,
        id: 'q1',
        published: Moment().subtract(1, 'month').toDate(),
      });
      const q2 = new Quest({
        ...q.basic,
        id: 'q2',
        published: Moment().subtract(13, 'month').toDate(),
      });

      testingDBWithState([q1, q2])
        .then(db => searchQuests(db, '', { age: '31536000' })) // this year
        .then(results => {
          expect(results.map(r => r.get('id'))).toEqual(['q1']);
          done();
        })
        .catch(done);
    });
  });

  test('allows ordering results by created', done => {
    const q1 = new Quest({
      ...q.basic,
      id: 'q1',
      created: Moment().subtract(1, 'month').toDate(),
    });
    const q3 = new Quest({
      ...q.basic,
      id: 'q3',
      created: Moment().subtract(3, 'month').toDate(),
    });
    const q4 = new Quest({
      ...q.basic,
      id: 'q4',
      created: Moment().subtract(4, 'month').toDate(),
    });
    const q2 = new Quest({
      ...q.basic,
      id: 'q2',
      created: Moment().subtract(2, 'month').toDate(),
    });

    testingDBWithState([q1, q2, q3, q4])
      .then(tdb => searchQuests(tdb, '', { order: '-created' }))
      .then(results => {
        expect(results.map(r => r.get('id'))).toEqual(['q1', 'q2', 'q3', 'q4']);
        done();
      })
      .catch(done);
  });

  describe('publishQuest', () => {
    const q1 = new Quest({
      ...q.basic,
      id: 'q1',
      questversion: 1,
      questversionlastmajor: 1,
      ratingavg: 3.0,
      ratingcount: 5.0,
      userid: u.basic.id,
    });

    function publishAndLookup(
      state: any[],
      quest: Quest,
      majorrelease = false,
      userid = null,
    ): Promise<QuestInstance> {
      let db: any;
      return testingDBWithState(state)
        .then(tdb => {
          db = tdb;
          return publishQuest(
            db,
            ms,
            userid || quest.userid,
            majorrelease,
            new Quest({ id: quest.id, partition: quest.partition }),
            'test_xml',
          );
        })
        .then(results => {
          return db.quests.findOne({
            where: { id: quest.id, partition: quest.partition },
          });
        })
        .then((i: QuestInstance | null) => {
          if (i === null) {
            throw new Error('Quest must exist');
          }
          return i;
        });
    }

    test('shows up in public search results', async () => {
      const db = await testingDBWithState([q.basic]);
      await republishQuest(db, q.basic.partition, q.basic.id);
      const rows = await searchQuests(db, q.basic.userid, {});
      expect(rows.map(r => r.get('id'))).toContain(q.basic.id);
    });

    test('increments user loot_points by 100 if new and public', async () => {
      const db = await testingDBWithState([u.basic]);
      await publishQuest(
        db,
        ms,
        u.basic.id,
        false,
        new Quest({ ...q.basic, userid: u.basic.id }),
        '<quest/>',
      );
      await new Promise(resolve => setTimeout(resolve, 25));
      expect((await db.users.findOne())!.get('lootPoints')).toBe(100);
    });

    test('does not change user loot_points if not new or not public', async () => {
      for (const quest of [
        new Quest({ ...q.basic, userid: u.basic.id }),
        new Quest({ ...q.private, userid: u.basic.id }),
      ]) {
        const db = await testingDBWithState([u.basic, quest]);
        await publishQuest(db, ms, u.basic.id, false, quest, '<quest/>');
        expect((await db.users.findOne())!.get('lootPoints')).toBe(0);
      }
    });

    test('fails to publish unowned quest', async () => {
      await expect(
        publishAndLookup([u.basic, q1], q1, false, 'badactor'),
      ).rejects.toThrow('Invalid user');
    });

    test('updates questversion but not lastmajor on non-major release', done => {
      publishAndLookup([u.basic, q1], q1, false)
        .then((i: QuestInstance) => {
          expect(i).not.toBeNull();
          expect(i.get('questversion')).toEqual(q1.questversion + 1);
          expect(i.get('questversionlastmajor')).toEqual(
            q1.questversionlastmajor,
          );
          done();
        })
        .catch(done);
    });

    test('increments questversionlastmajor and questversion on major release', done => {
      publishAndLookup([u.basic, q1], q1, true)
        .then((i: QuestInstance) => {
          expect(i).not.toBeNull();
          expect(i.get('questversion')).toEqual(q1.questversion + 1);
          expect(i.get('questversionlastmajor')).toEqual(
            q1.questversionlastmajor + 1,
          );
          done();
        })
        .catch(done);
    });

    test('removes a set tombstone', done => {
      publishAndLookup(
        [u.basic, new Quest({ ...q1, tombstone: new Date() })],
        q1,
        false,
      )
        .then((i: QuestInstance) => {
          expect(i.get('tombstone')).toEqual(null);
          done();
        })
        .catch(done);
    });

    test('blocks publish if fields missing or invalid', async () => {
      const db = await testingDBWithState([]);
      await expect(
        publishQuest(db, ms, '', false, q.basic, '<quest/>'),
      ).rejects.toThrow('no user id');
      await expect(
        publishQuest(db, ms, u.basic.id, false, q.basic, ''),
      ).rejects.toThrow('no xml data');
      expect(await db.quests.count()).toBe(0);
    });

    test('schema rejects invalid title metadata before publication', async () => {
      // Metadata validation is performed by Quest.create at the HTTP boundary.
      expect(
        Quest.create({ ...q.basic, title: 'x'.repeat(1000) }),
      ).toBeInstanceOf(Error);
    });

    test('mails if new quest', done => {
      const msSendSpy = jest
        .spyOn(ms, 'send')
        .mockImplementation(() => undefined);
      publishAndLookup([u.basic], q1, false)
        .then((i: QuestInstance) => {
          expect(msSendSpy).toHaveBeenCalled();
          done();
        })
        .catch(done);
    });

    test('does not mail if existing quest', done => {
      const msSendSpy = jest
        .spyOn(ms, 'send')
        .mockImplementation(() => undefined);
      publishAndLookup([u.basic, q1], q1, false)
        .then((i: QuestInstance) => {
          expect(msSendSpy).not.toHaveBeenCalled();
          done();
        })
        .catch(done);
    });

    test('preserves ratings on non-major release', done => {
      publishAndLookup([u.basic, q1], q1, false)
        .then((i: QuestInstance) => {
          expect(i.get('ratingavg')).toEqual(q1.ratingavg);
          expect(i.get('ratingcount')).toEqual(q1.ratingcount);
          done();
        })
        .catch(done);
    });

    test('resets ratings on major release', done => {
      publishAndLookup([u.basic, q1], q1, true)
        .then((i: QuestInstance) => {
          expect(i.get('ratingavg')).toEqual(0);
          expect(i.get('ratingcount')).toEqual(0);
          done();
        })
        .catch(done);
    });
  });

  describe('unpublishQuest', () => {
    test('unpublishes owned quest', async () => {
      const db = await testingDBWithState([q.basic]);
      await unpublishQuest(db, q.basic.partition, q.basic.id);
      expect((await db.quests.findOne())!.get('tombstone')).toBeInstanceOf(
        Date,
      );
    });
    test('no longer shows up in search results', async () => {
      const db = await testingDBWithState([q.basic]);
      await unpublishQuest(db, q.basic.partition, q.basic.id);
      expect(await searchQuests(db, q.basic.userid, {})).toEqual([]);
    });
    test('unpublish cannot affect a different partition', async () => {
      // This primitive also serves administrators; ownership is checked by the HTTP handler.
      const db = await testingDBWithState([q.basic]);
      await unpublishQuest(db, 'other-partition', q.basic.id);
      expect(
        (await searchQuests(db, q.basic.userid, {})).map(r => r.get('id')),
      ).toContain(q.basic.id);
    });
  });

  describe('republishQuest', () => {
    test('shows up in public search results', async () => {
      const db = await testingDBWithState([q.basic]);
      await republishQuest(db, q.basic.partition, q.basic.id);
      const rows = await searchQuests(db, q.basic.userid, {});
      expect(rows.map(r => r.get('id'))).toContain(q.basic.id);
    });
  });

  describe('updateQuestRatings', () => {
    test('calculates the count and average of multiple ratings', done => {
      const q1 = new Quest({
        ...q.basic,
        partition: Partition.expeditionPublic,
        id: f.rating.questid,
        created: Moment().subtract(1, 'month').toDate(),
      });
      let db: any;
      testingDBWithState([q1, f.rating])
        .then(tdb => {
          db = tdb;
          return updateQuestRatings(db, q1.partition, q1.id);
        })
        .then(() => getQuest(db, q1.partition, q1.id))
        .then(result => {
          expect(result.ratingcount).toEqual(1);
          expect(result.ratingavg).toEqual(4);
          done();
        })
        .catch(done);
    });

    test('excludes ratings from quest versions before the last major release', async () => {
      const quest = new Quest({
        ...q.basic,
        questversion: 3,
        questversionlastmajor: 2,
      });
      const db = await testingDBWithState([
        quest,
        new Feedback({
          ...f.rating,
          userid: 'old',
          questversion: 1,
          rating: 1,
        }),
        new Feedback({
          ...f.rating,
          userid: 'current',
          questversion: 2,
          rating: 5,
        }),
      ]);
      const row = await updateQuestRatings(db, quest.partition, quest.id);
      expect(row.get('ratingcount')).toBe(1);
      expect(row.get('ratingavg')).toBe(5);
    });
  });
});

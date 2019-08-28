import { object } from 'joi';
import { Expansion, Partition } from 'shared/schema/Constants';
import { Quest } from 'shared/schema/Quests';
import { QuestInstance } from './Database';
import {
  getQuest,
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
        .catch(done.fail);
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
        .catch(done.fail);
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
            jasmine.objectContaining({ id: q.future.id }),
          );
          done();
        })
        .catch(done.fail);
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
            jasmine.objectContaining({ id: q.horror.id }),
          );
          done();
        })
        .catch(done.fail);
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
            jasmine.objectContaining({ id: 'questid' }),
          );
          done();
        })
        .catch(done.fail);
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
            jasmine.objectContaining({ id: 'questidhorror' }),
          );
          done();
        })
        .catch(done.fail);
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
        .catch(done.fail);
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
            jasmine.objectContaining({
              partition: Partition.expeditionPrivate,
            }),
          );
          expect((results[1] as any).dataValues).toEqual(
            jasmine.objectContaining({ partition: Partition.expeditionPublic }),
          );
          done();
        })
        .catch(done.fail);
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
            jasmine.objectContaining({
              partition: Partition.expeditionPrivate,
            }),
          );
          expect(results[1].dataValues).toEqual(
            jasmine.objectContaining({ partition: Partition.expeditionPublic }),
          );
          done();
        })
        .catch(done.fail);
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
            if (results[0][key].hasOwnProperty('partition')) {
              expect(results[0][key].partition).toEqual(
                Partition.expeditionPublic,
              );
            }
          });
          done();
        })
        .catch(done.fail);
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
              jasmine.objectContaining({ official: true }),
            );
          }
          done();
        })
        .catch(done.fail);
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
              jasmine.objectContaining({ userid: q.basic.userid }),
            );
          }
          done();
        })
        .catch(done.fail);
    });

    test('+ratingavg (default) orders by newly published & little-rated, rating, then rating count', done => {
      const q1 = new Quest({
        ...q.basic,
        id: 'q1',
        ratingavg: 4.0,
        ratingcount: 10,
        created: Moment().subtract(1, 'month'),
      });
      const q2 = new Quest({
        ...q.basic,
        id: 'q2',
        ratingavg: 5.0,
        ratingcount: 6,
        created: Moment().subtract(1, 'month'),
      });
      const q3 = new Quest({
        ...q.basic,
        id: 'q3',
        ratingavg: 5.0,
        ratingcount: 8,
        created: Moment().subtract(1, 'month'),
      });
      const q4 = new Quest({
        ...q.basic,
        id: 'q4',
        ratingavg: 4.5,
        ratingcount: 4,
        created: Moment().subtract(6, 'days'),
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
        .catch(done.fail);
    });

    test('+ratingavg orders new quests with <5 ratings before quests with high rating count', done => {
      const q1 = new Quest({
        ...q.basic,
        id: 'q1',
        ratingavg: 4.0,
        ratingcount: 10,
        created: Moment().subtract(1, 'month'),
      });
      const q2 = new Quest({
        ...q.basic,
        id: 'q2',
        ratingavg: 4.0,
        ratingcount: 2,
        created: Moment().subtract(1, 'day'),
      });

      testingDBWithState([q1, q2])
        .then(tdb => searchQuests(tdb, '', { order: '+ratingavg' }))
        .then(results => {
          expect(results.map(r => r.get('id'))).toEqual(['q2', 'q1']);
          done();
        })
        .catch(done.fail);
    });

    test('+ratingavg orders null ratings/counts last', done => {
      const q1 = new Quest({
        ...q.basic,
        id: 'q1',
        ratingavg: null,
        ratingcount: null,
        created: Moment().subtract(1, 'month'),
      });
      const q2 = new Quest({
        ...q.basic,
        id: 'q2',
        ratingavg: 4.0,
        ratingcount: 2,
        created: Moment().subtract(1, 'day'),
      });

      testingDBWithState([q1, q2])
        .then(tdb => searchQuests(tdb, '', { order: '+ratingavg' }))
        .then(results => {
          expect(results.map(r => r.get('id'))).toEqual(['q2', 'q1']);
          done();
        })
        .catch(done.fail);
    });

    test('+ratingavg orders old quests with few ratings after quests with high rating count', done => {
      const q1 = new Quest({
        ...q.basic,
        id: 'q1',
        ratingavg: 4.0,
        ratingcount: 10,
        created: Moment().subtract(1, 'month'),
      });
      const q2 = new Quest({
        ...q.basic,
        id: 'q2',
        ratingavg: 4.0,
        ratingcount: 2,
        created: Moment().subtract(1, 'month'),
      });

      testingDBWithState([q1, q2])
        .then(tdb => searchQuests(tdb, '', { order: '+ratingavg' }))
        .then(results => {
          expect(results.map(r => r.get('id'))).toEqual(['q1', 'q2']);
          done();
        })
        .catch(done.fail);
    });

    test('age filter works', done => {
      const q1 = new Quest({
        ...q.basic,
        id: 'q1',
        published: Moment().subtract(1, 'month'),
      });
      const q2 = new Quest({
        ...q.basic,
        id: 'q2',
        published: Moment().subtract(13, 'month'),
      });

      testingDBWithState([q1, q2])
        .then(db => searchQuests(db, '', { age: '31536000' })) // this year
        .then(results => {
          expect(results.map(r => r.get('id'))).toEqual(['q1']);
          done();
        })
        .catch(done.fail);
    });
  });

  test('allows ordering results by created', done => {
    const q1 = new Quest({
      ...q.basic,
      id: 'q1',
      created: Moment().subtract(1, 'month'),
    });
    const q3 = new Quest({
      ...q.basic,
      id: 'q3',
      created: Moment().subtract(3, 'month'),
    });
    const q4 = new Quest({
      ...q.basic,
      id: 'q4',
      created: Moment().subtract(4, 'month'),
    });
    const q2 = new Quest({
      ...q.basic,
      id: 'q2',
      created: Moment().subtract(2, 'month'),
    });

    testingDBWithState([q1, q2, q3, q4])
      .then(tdb => searchQuests(tdb, '', { order: '-created' }))
      .then(results => {
        expect(results.map(r => r.get('id'))).toEqual(['q1', 'q2', 'q3', 'q4']);
        done();
      })
      .catch(done.fail);
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

    test.skip('shows up in public search results', () => {
      /* TODO */
    });

    test.skip('increments user loot_points by 100 if new and public', () => {
      /* TODO */
    });

    test.skip('does not change user loot_points if not new or not public', () => {
      /* TODO */
    });

    test.skip('fails to publish unowned quest', done => {
      // publishAndLookup([u.basic, new Quest({...q1, tombstone: new Date()})], q1, false, "badactor").then((i: QuestInstance) => {
      //   done.fail('Expected failure');
      // }).catch((e) => {
      //   expect(e.toString()).toContain("Invalid user");
      //   done();
      // });
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
        .catch(done.fail);
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
        .catch(done.fail);
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
        .catch(done.fail);
    });

    test.skip('blocks publish if fields missing or invalid', () => {
      /* TODO */
    });

    test.skip('blocks publish if title is still default', () => {
      /* TODO */
    });

    test('mails if new quest', done => {
      const msSendSpy = spyOn(ms, 'send');
      publishAndLookup([u.basic], q1, false)
        .then((i: QuestInstance) => {
          expect(msSendSpy).toHaveBeenCalled();
          done();
        })
        .catch(done.fail);
    });

    test('does not mail if existing quest', done => {
      const msSendSpy = spyOn(ms, 'send');
      publishAndLookup([u.basic, q1], q1, false)
        .then((i: QuestInstance) => {
          expect(msSendSpy).not.toHaveBeenCalled();
          done();
        })
        .catch(done.fail);
    });

    test('preserves ratings on non-major release', done => {
      publishAndLookup([u.basic, q1], q1, false)
        .then((i: QuestInstance) => {
          expect(i.get('ratingavg')).toEqual(q1.ratingavg);
          expect(i.get('ratingcount')).toEqual(q1.ratingcount);
          done();
        })
        .catch(done.fail);
    });

    test('resets ratings on major release', done => {
      publishAndLookup([u.basic, q1], q1, true)
        .then((i: QuestInstance) => {
          expect(i.get('ratingavg')).toEqual(0);
          expect(i.get('ratingcount')).toEqual(0);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('unpublishQuest', () => {
    test.skip('unpublishes owned quest', () => {
      /* TODO */
    });
    test.skip('no longer shows up in search results', () => {
      /* TODO */
    });
    test.skip('fails to unpublish unowned quest', () => {
      /* TODO */
    });
  });

  describe('republishQuest', () => {
    test.skip('shows up in public search results', () => {
      /* TODO */
    });
  });

  describe('updateQuestRatings', () => {
    test('calculates the count and average of multiple ratings', done => {
      const q1 = new Quest({
        ...q.basic,
        partition: Partition.expeditionPublic,
        id: f.rating.questid,
        created: Moment().subtract(1, 'month'),
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
        .catch(done.fail);
    });

    test.skip('excludes ratings from quest versions before the last major release', () => {
      /* TODO */
    });
  });
});

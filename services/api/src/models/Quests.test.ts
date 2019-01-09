import { object } from 'joi';
import { Partition } from 'shared/schema/Constants';
import { Quest } from 'shared/schema/Quests';
import { QuestInstance } from './Database';
import { searchQuests } from './Quests';
import { quests as q, testingDBWithState } from './TestData';

const Moment = require('moment');

describe('quest', () => {
  describe('searchQuests', () => {
    const quests = [q.basic, q.private, q.privateUser2, q.horror, q.future];

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
            expansions: ['horror'],
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

    test('returns only private quests belonging to provided user', done => {
      testingDBWithState(quests)
        .then(tdb => {
          return searchQuests(tdb, q.basic.userid, {
            partition: Partition.expeditionPublic,
            showPrivate: true,
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

    test('+ratingavg (default) orders by newly published, rating, then rating count', done => {
      const q1 = new Quest({
        ...q.basic,
        id: 'q1',
        ratingavg: 4.0,
        ratingcount: 6,
        created: Moment().subtract(1, 'month'),
      });
      const q2 = new Quest({
        ...q.basic,
        id: 'q2',
        ratingavg: 5.0,
        ratingcount: 1,
        created: Moment().subtract(1, 'month'),
      });
      const q3 = new Quest({
        ...q.basic,
        id: 'q3',
        ratingavg: 5.0,
        ratingcount: 3,
        created: Moment().subtract(1, 'month'),
      });
      const q4 = new Quest({
        ...q.basic,
        id: 'q4',
        ratingavg: 4.5,
        ratingcount: 1,
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
    test.skip('shows up in public search results', () => {
      /* TODO */
    });

    test.skip('increments user loot_points by 100 if new and public', () => {
      /* TODO */
    });

    test.skip('does not change user loot_points if not new or not public', () => {
      /* TODO */
    });

    test.skip('unpublishes owned quest', () => {
      /* TODO */
    });

    test.skip('fails to publish/unpublish unowned quest', () => {
      /* TODO */
    });

    test.skip('always updates questversion', () => {
      /* TODO */
    });

    test.skip('increments questversionlastmajor when major release flag is true', () => {
      /* TODO */
    });

    test.skip('removes a set tombstone', () => {
      /* TODO */
    });

    test.skip('blocks publish if fields missing or invalid', () => {
      /* TODO */
    });

    test.skip('blocks publish if title is still default', () => {
      /* TODO */
    });

    test.skip('mails admin if new quest', () => {
      /* TODO */
    });

    test.skip('mails user if first published quest', () => {
      /* TODO */
    });
  });

  describe('unpublishQuest', () => {
    test.skip('no longer shows up in search results', () => {
      /* TODO */
    });
  });

  describe('republishQuest', () => {
    test.skip('shows up in public search results', () => {
      /* TODO */
    });
  });

  describe('updateQuestRatings', () => {
    test.skip('calculates the count and average of multiple ratings', () => {
      /* TODO */
    });

    test.skip('excludes ratings from quest versions before the last major release', () => {
      /* TODO */
    });
  });
});

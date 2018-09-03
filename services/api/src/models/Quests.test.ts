import {PUBLIC_PARTITION} from 'shared/schema/Constants';
import {Quest} from 'shared/schema/Quests';
import {QuestInstance} from './Database';
import {searchQuests} from './Quests';
import {
  quests as q,
  testingDBWithState,
} from './TestData';

describe('quest', () => {
  describe('searchQuests', () => {
    test('returns an empty array if no results', (done: DoneFn) => {
      testingDBWithState([q.basic, q.expansion])
        .then((tdb) => {
          return searchQuests(tdb, '', {partition: 'otherpartition'});
        })
        .then((results) => {
          expect(results.length).toEqual(0);
          done();
        })
        .catch(done.fail);
    });

    test('returns full quest data', (done: DoneFn) => {
      testingDBWithState([q.basic, q.expansion])
        .then((tdb) => {
          return searchQuests(tdb, '', {partition: PUBLIC_PARTITION});
        })
        .then((results: QuestInstance[]) => {
          expect(results.length).toEqual(1);
          const resolved = new Quest(results[0].dataValues);
          for (const k of Object.keys(q.basic.optionsMap)) {
            expect((resolved as any)[k]).toEqual((q.basic as any)[k]);
          }
          done();
        })
        .catch(done.fail);
    });

    test('does not return expansions if unspecified', (done: DoneFn) => {
      testingDBWithState([q.basic, q.expansion])
        .then((tdb) => {
          return searchQuests(tdb, '', {partition: PUBLIC_PARTITION});
        })
        .then((results: QuestInstance[]) => {
          expect(results.length).toEqual(1);
          expect((results[0] as any).dataValues).toEqual(jasmine.objectContaining({id: 'questid'}));
          done();
        })
        .catch(done.fail);
    });

    test('returns expansion quests first if specified', (done: DoneFn) => {
      testingDBWithState([q.basic, q.expansion])
        .then((db) => searchQuests(db, '', {partition: PUBLIC_PARTITION, expansions: ['horror']}))
        .then((results: QuestInstance[]) => {
          expect(results.length).toEqual(2);
          expect((results[0] as any).dataValues).toEqual(jasmine.objectContaining({id: 'questidhorror'}));
          done();
        })
        .catch(done.fail);
    });

    fit('orders by rating, then rating count when +ratingavg order is given', (done: DoneFn) => {
      const q1 = new Quest({...q.basic, id: 'q1', ratingavg: 4.0, ratingcount: 6});
      const q2 = new Quest({...q.basic, id: 'q2', ratingavg: 5.0, ratingcount: 1});
      const q3 = new Quest({...q.basic, id: 'q3', ratingavg: 5.0, ratingcount: 3});

      testingDBWithState([q1, q2, q3])
        .then((db) => searchQuests(db, '', {order: '+ratingavg'}))
        .then((results: QuestInstance[]) => {
          expect(results.map((r) => r.get('id'))).toEqual(['q3', 'q2', 'q1']);
          done();
        })
        .catch(done.fail);
    });

    test.skip('also displays draft quests when user provided', () => { /* TODO */ });
  });

  describe('publishQuest', () => {
    test.skip('shows up in public search results', () => { /* TODO */ });

    test.skip('increments user loot_points by 100 if new and public', () => { /* TODO */ });

    test.skip('does not change user loot_points if not new or not public', () => { /* TODO */ });

    test.skip('unpublishes owned quest', () => { /* TODO */ });

    test.skip('fails to publish/unpublish unowned quest', () => { /* TODO */ });

    test.skip('always updates questversion', () => { /* TODO */ });

    test.skip('increments questversionlastmajor when major release flag is true', () => { /* TODO */ });

    test.skip('removes a set tombstone', () => { /* TODO */ });

    test.skip('blocks publish if fields missing or invalid', () => { /* TODO */ });

    test.skip('blocks publish if title is still default', () => { /* TODO */ });

    test.skip('mails admin if new quest', () => { /* TODO */ });

    test.skip('mails user if first published quest', () => { /* TODO */ });
  });

  describe('unpublishQuest', () => {
    test.skip('no longer shows up in search results', () => { /* TODO */ });
  });

  describe('republishQuest', () => {
    test.skip('shows up in public search results', () => { /* TODO */ });
  });

  describe('updateQuestRatings', () => {
    test.skip('calculates the count and average of multiple ratings', () => { /* TODO */ });

    test.skip('excludes ratings from quest versions before the last major release', () => { /* TODO */ });
  });
});

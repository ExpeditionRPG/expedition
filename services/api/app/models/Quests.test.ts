import {searchQuests} from './Quests'
import {QuestInstance} from './Database'
import {PUBLIC_PARTITION} from '@expedition-qdl/schema/Constants'
import {Quest} from '@expedition-qdl/schema/Quests'
import {
  testingDBWithState,
  quests as q,
} from './TestData'

describe('quest', () => {
  describe('searchQuests', () => {
    it('returns an empty array if no results', (done: DoneFn) => {
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

    it('returns full quest data', (done: DoneFn) => {
      testingDBWithState([q.basic, q.expansion])
        .then((tdb) => {
          return searchQuests(tdb, '', {partition: PUBLIC_PARTITION});
        })
        .then((results: QuestInstance[]) => {
          expect(results.length).toEqual(1);
          const resolved = new Quest(results[0].dataValues)
          for (const k of Object.keys(q.basic.optionsMap)) {
            expect((resolved as any)[k]).toEqual((q.basic as any)[k]);
          }
          done();
        })
        .catch(done.fail);
    });

    it('does not return expansions if unspecified', (done: DoneFn) => {
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

    it('returns expansion quests first if specified', (done: DoneFn) => {
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

    it('also displays draft quests when user provided');
  });

  describe('publishQuest', () => {
    it('shows up in public search results');

    it('increments user loot_points by 100 if new and public');

    it('does not change user loot_points if not new or not public');

    it('unpublishes owned quest');

    it('fails to publish/unpublish unowned quest');

    it('always updates questversion');

    it('increments questversionlastmajor when major release flag is true');

    it('removes a set tombstone');

    it('blocks publish if fields missing or invalid');

    it('blocks publish if title is still default');

    it('mails admin if new quest');

    it('mails user if first published quest');
  });

  describe('unpublishQuest', () => {
    it('no longer shows up in search results');
  });

  describe('republishQuest', () => {
    it('shows up in public search results');
  });

  describe('updateQuestRatings', () => {
    it('calculates the count and average of multiple ratings');

    it('excludes ratings from quest versions before the last major release');
  });
});

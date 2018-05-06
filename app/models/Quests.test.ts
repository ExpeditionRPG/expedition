import {Quest, QuestInstance} from './Quests'
import {Quest as QuestAttributes} from 'expedition-qdl/lib/schema/Quests'
import {PUBLIC_PARTITION} from 'expedition-qdl/lib/schema/Constants'
import {PLACEHOLDER_DATE} from 'expedition-qdl/lib/schema/SchemaBase'
import Sequelize from 'sequelize'

describe('quest', () => {
  let q: Quest;

  const insertedQuest = new QuestAttributes({
    partition: PUBLIC_PARTITION,
    author: 'testauthor',
    contentrating: 'Adult',
    engineversion: '1.0.0',
    familyfriendly: false,
    genre: 'Comedy',
    maxplayers: 6,
    maxtimeminutes: 60,
    minplayers: 1,
    mintimeminutes: 30,
    summary: 'This be a test quest!',
    title: 'Test Quest',
    userid: 'testuser',
    id: 'questid',
    ratingavg: 0,
    ratingcount: 0,
    email: 'author@test.com',
    url: 'http://test.com',
    created: new Date(),
    published: new Date(),
    publishedurl: 'http://testpublishedquesturl.com',
    questversion: 1,
    questversionlastmajor: 1,
    tombstone: PLACEHOLDER_DATE,
    expansionhorror: false,
    language: 'English',
  });

  const expansionQuest = new QuestAttributes({
    partition: PUBLIC_PARTITION,
    author: 'testauthor',
    contentrating: 'Adult',
    engineversion: '1.0.0',
    familyfriendly: false,
    genre: 'Comedy',
    maxplayers: 6,
    maxtimeminutes: 60,
    minplayers: 1,
    mintimeminutes: 30,
    summary: 'This be a horror quest! AHHH!',
    title: 'Horror Quest',
    userid: 'testuser',
    id: 'questidhorror',
    ratingavg: 0,
    ratingcount: 0,
    email: 'author@test.com',
    url: 'http://test.com',
    created: new Date(),
    published: new Date(),
    publishedurl: 'http://testpublishedquesturl.com',
    questversion: 1,
    questversionlastmajor: 1,
    tombstone: PLACEHOLDER_DATE,
    expansionhorror: true,
    language: 'English',
  });

  beforeEach((done: DoneFn) => {
    const s = new Sequelize({dialect: 'sqlite', storage: ':memory:'})
    q = new Quest(s);
    q.model.sync()
      .then(() => {
        return q.create(insertedQuest);
      })
      .then(() => {
        return q.create(expansionQuest);
      })
      .then(() => done())
      .catch(done.fail);
  });


  describe('searchQuests', () => {
    it('returns an empty array if no results', () => {
      return q.search('', {partition: 'otherpartition'})
        .then((results: QuestInstance[]) => {
          expect(results.length).toEqual(0);
        });
    });

    it('returns full quest data', () => {
      return q.search('', {partition: PUBLIC_PARTITION})
        .then((results: QuestInstance[]) => {
          expect(results.length).toEqual(1);
          const resolved = q.resolveInstance(results[0])
          for (const k of Object.keys(insertedQuest.optionsMap)) {
            expect((resolved as any)[k]).toEqual((insertedQuest as any)[k]);
          }
        });
    });

    it('does not return expansions if unspecified', () => {
      return q.search('', {partition: PUBLIC_PARTITION})
        .then((results: QuestInstance[]) => {
          expect(results.length).toEqual(1);
          expect((results[0] as any).dataValues).toEqual(jasmine.objectContaining({id: 'questid'}));
        });
    });

    it('returns expansion quests first if specified', () => {
      return q.search('', {partition: PUBLIC_PARTITION, expansions: ['horror']})
        .then((results: QuestInstance[]) => {
          expect(results.length).toEqual(2);
          expect((results[0] as any).dataValues).toEqual(jasmine.objectContaining({id: 'questidhorror'}));
        });
    });

    it('also displays draft quests when user provided');
  });

  describe('read', () => {
    it('reads full quest data');

    it('fails to read unpublished quest when no logged in user match');

    it('reads published quest when no logged in user match');
  });

  describe('resolveInstance', () => {
    it('resolves all attributes with defaults', () => {
      const resolved = q.resolveInstance({dataValues: {partition: PUBLIC_PARTITION, id: 'test'}} as any);
      // To prevent flakiness, just check a couple values are defined.
      // Coverage should be guaranteed by compile-time type checking.
      expect(resolved.partition).toEqual(PUBLIC_PARTITION);
      expect(resolved.id).toEqual('test');
      expect(resolved.userid).toEqual('');

      // Tombstone should be empty when not defined
      expect(resolved.tombstone).toEqual(PLACEHOLDER_DATE);

      // Publish date should default to now-ish
      expect(Date.now() - resolved.published.getTime()).toBeLessThan(10*1000);
    });
  })

  describe('update', () => {
    it('updates all non-automatic quest fields');

    it('upserts quest if no id');

    it('fails update with invalid ID');

    it('fails update from different user');
  });

  describe('tombstone', () => {
    it('sets tombstone if matching id and user');

    it('fails to set tombstone if no match');
  });

  describe('publish', () => {
    it('publishes owned quest');

    it('increments user loot_points by 100 if new and public');

    it('does not change user loot_points if not new or not public');

    it('unpublishes owned quest');

    it('fails to publish/unpublish unowned quest');

    it('always updates questversion');

    it('increments questversionlastmajor when major release flag is true');

    it('removes a set tombstone');

    it('blocks publish if fields missing or invalid');

    it('blocks publish if title is still default');
  });

  describe('calculate ratings', () => {
    it('calulcates the count and average of multiple ratings');

    it('excludes ratings from quest versions before the last major release');
  });
});

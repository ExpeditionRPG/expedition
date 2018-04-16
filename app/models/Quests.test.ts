import {Quest, QuestAttributes, QuestInstance} from './Quests'
import * as Sequelize from 'sequelize'
const expect = require('expect');

describe('quest', () => {
  let q: Quest;

  const insertedQuest: QuestAttributes = {
    partition: 'expedition-public',
    author: 'testauthor',
    contentrating: 'mature',
    engineversion: '1.0.0',
    familyfriendly: false,
    genre: 'testgenre',
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
    tombstone: null,
    expansionhorror: false,
    language: 'English',
  };

  const expansionQuest: QuestAttributes = {
    partition: 'expedition-public',
    author: 'testauthor',
    contentrating: 'mature',
    engineversion: '1.0.0',
    familyfriendly: false,
    genre: 'testgenre',
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
    tombstone: null,
    expansionhorror: true,
    language: 'English',
  }

  beforeEach((done: () => any) => {
    const s = new Sequelize({dialect: 'sqlite', storage: ':memory:'})
    q = new Quest(s);
    q.model.sync()
      .then(() => {
        return q.model.create(insertedQuest);
      })
      .then(() => {
        return q.model.create(expansionQuest);
      })
      .then(() => {done();})
      .catch((e: Error) => {throw e;});
  });


  describe('searchQuests', () => {
    it('returns an empty array if no results', () => {
      return q.search('', {partition: 'otherpartition'})
        .then((results: QuestInstance[]) => {
          expect(results.length).toEqual(0);
        });
    });

    it('returns full quest data', () => {
      return q.search('', {partition: 'expedition-public'})
        .then((results: QuestInstance[]) => {
          expect(results.length).toEqual(1);
          expect((results[0] as any).dataValues).toEqual(insertedQuest);
        })
    });

    it('does not return expansions if unspecified', () => {
      return q.search('', {partition: 'expedition-public'})
        .then((results: QuestInstance[]) => {
          expect(results.length).toEqual(1);
          expect((results[0] as any).dataValues).toEqual(insertedQuest);
        })
    });

    it('returns expansion quests first if specified', () => {
      return q.search('', {partition: 'expedition-public', expansions: ['horror']})
        .then((results: QuestInstance[]) => {
          expect(results.length).toEqual(2);
          expect((results[0] as any).dataValues).toEqual(expansionQuest);
        })
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
      const resolved = q.resolveInstance({get: () => {return undefined;}} as any);
      // To prevent flakiness, just check a couple values are defined.
      // Coverage should be guaranteed by compile-time type checking.
      expect(resolved.partition).toEqual('');
      expect(resolved.id).toEqual('');
      expect(resolved.userid).toEqual('');

      // Dated events should explicitly be null when not defined
      expect(resolved.tombstone).toEqual(null);
      expect(resolved.published).toEqual(null);
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

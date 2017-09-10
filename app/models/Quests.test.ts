import {Quest, QuestAttributes, QuestInstance} from './Quests'
import * as Sequelize from 'sequelize'
const expect = require('expect');
import {} from 'jasmine'

describe('quest', () => {
  let q: Quest;

  const insertedQuest: QuestAttributes = {
    partition: 'testpartition',
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
    ratingavg: 0,
    ratingcount: 0,
    tombstone: null,
    expansionhorror: false,
  };

  const expansionQuest: QuestAttributes = {
    partition: 'testpartition',
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
    ratingavg: 0,
    ratingcount: 0,
    tombstone: null,
    expansionhorror: true,
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
    it('returns an empty array if no results', (done: ()=>any) => {
      q.search('', {partition: 'otherpartition'})
        .then((results: QuestInstance[]) => {
          expect(results.length).toEqual(0);
          done();
        });
    });

    it('returns full quest data', (done: ()=>any) => {
      q.search('', {partition: 'testpartition'})
        .then((results: QuestInstance[]) => {
          expect(results.length).toEqual(1);
          expect(results[0].dataValues).toEqual(insertedQuest);
          done();
        });
    });

    it('does not return expansions if unspecified', (done: ()=>any) => {
      q.search('', {partition: 'testpartition'})
        .then((results: QuestInstance[]) => {
          expect(results.length).toEqual(1);
          expect(results[0].dataValues).toEqual(insertedQuest);
          done();
        });
    });

    it('returns expansion quests first if specified', (done: ()=>any) => {
      q.search('', {partition: 'testpartition', expansions: ['horror']})
        .then((results: QuestInstance[]) => {
          expect(results.length).toEqual(2);
          expect(results[0].dataValues).toEqual(expansionQuest);
          done();
        });
    });

    it('also displays draft quests when user provided');
  });

  describe('read', () => {
    it('reads full quest data');

    it('fails to read unpublished quest when no logged in user match');

    it('reads published quest when no logged in user match');
  });

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

    it('unpublishes owned quest');

    it('fails to publish/unpublish unowned quest');

    it('always updates questversion');

    it('increments questversionlastmajor when major release flag is true');
  });

  describe('calculate ratings', () => {
    it('calulcates the count and average of multiple ratings');

    it('excludes ratings from quest versions before the last major release');
  });
});

import {AnalyticsEvent} from 'expedition-qdl/lib/schema/AnalyticsEvents'
import {User} from 'expedition-qdl/lib/schema/Users'
import {Quest} from 'expedition-qdl/lib/schema/Quests'
import {Feedback} from 'expedition-qdl/lib/schema/Feedback'
import {RenderedQuest} from 'expedition-qdl/lib/schema/RenderedQuests'
import {SchemaBase, PLACEHOLDER_DATE} from 'expedition-qdl/lib/schema/SchemaBase'
import {PUBLIC_PARTITION} from 'expedition-qdl/lib/schema/Constants'
import {Database} from './Database'
import Sequelize from 'sequelize'
import {prepare} from './Schema'

export const TEST_NOW = new Date('2017-12-18T19:32:38.397Z');

const basicAnalyticsEvent = new AnalyticsEvent({
  category: 'quest',
  action: 'end',
  created: TEST_NOW,
  questID: 'questid',
  userID: 'userid',
  questVersion: 1,
  difficulty: 'NORMAL',
  platform: 'ios',
  players: 5,
  version: '1.0.0',
});
export const analyticsEvents = {
  questEnd: basicAnalyticsEvent,
  action: new AnalyticsEvent({
    ...basicAnalyticsEvent,
    category: 'category',
    action: 'action',
    json: '"test"',
  }),
};

export const users = {
  basic: new User({
    id: 'test',
    email: 'test@test.com',
    name: 'Test Testerson',
    created: TEST_NOW,
    lastLogin: TEST_NOW,
    lootPoints: 0,
  }),
};

const basicQuest = new Quest({
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

export const quests = {
  basic: basicQuest,
  expansion: new Quest({
    ...basicQuest,
    summary: 'This be a horror quest! AHHH!',
    title: 'Horror Quest',
    userid: 'testuser',
    expansionhorror: true,
    id: 'questidhorror',
  }),
};

const basicFeedback = new Feedback({
  created: new Date(),
  partition: PUBLIC_PARTITION,
  questid: 'questid',
  userid: 'userid',
  questversion: 1,
  rating: 0,
  text: 'This is feedback!',
  email: 'test@test.com',
  name: 'Test Testerson',
  difficulty: 'NORMAL',
  platform: 'ios',
  players: 5,
  version: '1.0.0',
  anonymous: false,
  tombstone: PLACEHOLDER_DATE,
});
export const feedback = {
  basic: basicFeedback,
  rating: new Feedback({
    ...basicFeedback,
    rating: 4.0,
    text: 'This is a rating',
  }),
  report: new Feedback({
    ...basicFeedback,
    text: 'This is a quest report',
  }),
}

export const renderedQuests = {
  basic: new RenderedQuest({
    partition: basicQuest.partition,
    id: basicQuest.id,
    questversion: 1,
    xml: '<quest><roleplay>test</roleplay></quest>',
  }),
};

export function testingDBWithState(state: SchemaBase[]): Promise<Database> {
  const db = new Database(new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  }));

  return Promise.all([
    db.analyticsEvent.sync(),
    db.users.sync(),
    db.quests.sync(),
    db.feedback.sync(),
    db.renderedQuests.sync(),
  ]).then(() => Promise.all(state.map((entry) => {
    if (entry instanceof AnalyticsEvent) {
      return db.analyticsEvent.create(prepare(entry)).then(() => null);
    }
    if (entry instanceof User) {
      return db.users.create(prepare(entry)).then(() => null);
    }
    if (entry instanceof Quest) {
      return db.quests.create(prepare(entry)).then(() => null);
    }
    if (entry instanceof Feedback) {
      return db.feedback.create(prepare(entry)).then(() => null);
    }
    if (entry instanceof RenderedQuest) {
      return db.renderedQuests.create(prepare(entry)).then(() => null);
    }
    throw new Error('Unsupported entry for testingDBWithState');
  }))).then(() => db);
}

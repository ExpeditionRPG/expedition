import {AnalyticsEvent} from 'expedition-qdl/schema/AnalyticsEvents'
import {User} from 'expedition-qdl/schema/Users'
import {Quest} from 'expedition-qdl/schema/Quests'
import {Feedback} from 'expedition-qdl/schema/Feedback'
import {RenderedQuest} from 'expedition-qdl/schema/RenderedQuests'
import {Event} from 'expedition-qdl/schema/multiplayer/Events'
import {SessionClient} from 'expedition-qdl/schema/multiplayer/SessionClients'
import {Session} from 'expedition-qdl/schema/multiplayer/Sessions'
import {SchemaBase, PLACEHOLDER_DATE} from 'expedition-qdl/schema/SchemaBase'
import {PUBLIC_PARTITION} from 'expedition-qdl/schema/Constants'
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

export const sessions = {
  basic: new Session({
    id: 12345,
    secret: 'abcd',
    eventCounter: 0,
    locked: false,
  }),
};

export const sessionClients = {
  basic: new SessionClient({
    session: 12345,
    client: users.basic.id,
    secret: 'abcd'
  }),
};

const basicEvent = new Event({
  session: sessions.basic.id,
  timestamp: TEST_NOW,
  client: users.basic.id,
  instance: '93840',
  id: 1,
  type: 'ACTION', json: '{}',
});
export const events = {
  basic: basicEvent,
  questPlay: new Event({
    ...basicEvent,
    json: JSON.stringify({event: {
      fn: 'fetchQuestXML',
      args: JSON.stringify({title: basicQuest.title}),
    }}),
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
    db.events.sync(),
    db.sessionClients.sync(),
    db.sessions.sync(),
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
    if (entry instanceof Event) {
      return db.events.create(prepare(entry)).then(() => null);
    }
    if (entry instanceof SessionClient) {
      return db.sessionClients.create(prepare(entry)).then(() => null);
    }
    if (entry instanceof Session) {
      return db.sessions.create(prepare(entry)).then(() => null);
    }
    throw new Error('Unsupported entry for testingDBWithState');
  }))).then(() => db);
}

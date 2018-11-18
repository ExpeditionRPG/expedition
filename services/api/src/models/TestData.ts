import Sequelize from 'sequelize';
import {AnalyticsEvent} from 'shared/schema/AnalyticsEvents';
import {PUBLIC_PARTITION} from 'shared/schema/Constants';
import {Feedback} from 'shared/schema/Feedback';
import {Event} from 'shared/schema/multiplayer/Events';
import {SessionClient} from 'shared/schema/multiplayer/SessionClients';
import {Session} from 'shared/schema/multiplayer/Sessions';
import {QuestData} from 'shared/schema/QuestData';
import {Quest} from 'shared/schema/Quests';
import {RenderedQuest} from 'shared/schema/RenderedQuests';
import {PLACEHOLDER_DATE, SchemaBase} from 'shared/schema/SchemaBase';
import {User} from 'shared/schema/Users';
import {Database} from './Database';
import {prepare} from './Schema';

export const TEST_NOW = new Date('2017-12-18T19:32:38.397Z');

const basicAnalyticsEvent = new AnalyticsEvent({
  action: 'end',
  category: 'quest',
  created: TEST_NOW,
  difficulty: 'NORMAL',
  platform: 'ios',
  players: 5,
  questID: 'questid',
  questVersion: 1,
  userID: 'userid',
  version: '1.0.0',
});
export const analyticsEvents = {
  action: new AnalyticsEvent({
    ...basicAnalyticsEvent,
    action: 'action',
    category: 'category',
    json: '"test"',
  }),
  questEnd: basicAnalyticsEvent,
};

export const users = {
  basic: new User({
    created: TEST_NOW,
    email: 'test@test.com',
    id: 'test',
    lastLogin: TEST_NOW,
    lootPoints: 0,
    name: 'Test Testerson',
  }),
};

const basicQuest = new Quest({
  author: 'testauthor',
  contentrating: 'Adult',
  created: new Date(),
  email: 'author@test.com',
  engineversion: '1.0.0',
  expansionhorror: false,
  expansionfuture: false,
  familyfriendly: false,
  genre: 'Comedy',
  id: 'questid',
  language: 'English',
  maxplayers: 6,
  maxtimeminutes: 60,
  minplayers: 1,
  mintimeminutes: 30,
  partition: PUBLIC_PARTITION,
  published: new Date(),
  publishedurl: 'http://testpublishedquesturl.com',
  questversion: 1,
  questversionlastmajor: 1,
  ratingavg: 0,
  ratingcount: 0,
  summary: 'This be a test quest!',
  title: 'Test Quest',
  tombstone: PLACEHOLDER_DATE,
  url: 'http://test.com',
  userid: 'testuser',
});

export const quests = {
  basic: basicQuest,
  horror: new Quest({
    ...basicQuest,
    expansionhorror: true,
    id: 'questidhorror',
    summary: 'This be a horror quest! AHHH!',
    title: 'Horror Quest',
    userid: 'testuser',
  }),
  future: new Quest({
    ...basicQuest,
    expansionhorror: true,
    expansionfuture: true,
    id: 'questidfuture',
    summary: 'This be a future quest! AHHH!',
    title: 'Future Quest',
    userid: 'testuser',
  }),
};

const basicQuestData = new QuestData({
  id: 'questid',
  userid: 'userid',
  created: TEST_NOW,
  data: 'test text',
  notes: 'test notes',
  metadata: JSON.stringify({test: 'meta'}),
});

export const questData = {
  basic: basicQuestData,
  older: new QuestData({
    ...basicQuestData,
    created: new Date(TEST_NOW.getTime() - 24 * 60 * 60 * 1000),
  }),
};

const basicFeedback = new Feedback({
  anonymous: false,
  created: new Date(),
  difficulty: 'NORMAL',
  email: 'test@test.com',
  name: 'Test Testerson',
  partition: PUBLIC_PARTITION,
  platform: 'ios',
  players: 5,
  questid: 'questid',
  questline: 321,
  questversion: 1,
  rating: 0,
  text: 'This is feedback!',
  tombstone: PLACEHOLDER_DATE,
  userid: 'userid',
  version: '1.0.0',
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
};

export const renderedQuests = {
  basic: new RenderedQuest({
    id: basicQuest.id,
    partition: basicQuest.partition,
    questversion: 1,
    xml: '<quest><roleplay>test</roleplay></quest>',
  }),
};

export const sessions = {
  basic: new Session({
    eventCounter: 0,
    id: 12345,
    locked: false,
    secret: 'abcd',
  }),
};

export const sessionClients = {
  basic: new SessionClient({
    client: users.basic.id,
    secret: 'abcd',
    session: 12345,
  }),
};

const basicEvent = new Event({
  client: users.basic.id,
  id: 1,
  instance: '93840',
  json: '{}',
  session: sessions.basic.id,
  timestamp: TEST_NOW,
  type: 'ACTION',
});
export const events = {
  basic: basicEvent,
  questPlay: new Event({
    ...basicEvent,
    json: JSON.stringify({event: {
      args: JSON.stringify({title: basicQuest.title}),
      fn: 'fetchQuestXML',
    }}),
  }),
};

export function testingDBWithState(state: SchemaBase[]): Promise<Database> {
  const db = new Database(new Sequelize({
    dialect: 'sqlite',
    logging: false,
    storage: ':memory:',
  }));

  return Promise.all([
    db.analyticsEvent.sync(),
    db.users.sync(),
    db.quests.sync(),
    db.questData.sync(),
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
    if (entry instanceof QuestData) {
      return db.questData.create(prepare(entry)).then(() => null);
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

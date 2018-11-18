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
import {PLACEHOLDER_DATE} from 'shared/schema/SchemaBase';
import {User} from 'shared/schema/Users';
import {toSequelize} from './Schema';

export interface AnalyticsEventInstance extends Sequelize.Instance<Partial<AnalyticsEvent>> {dataValues: AnalyticsEvent; }
export type AnalyticsEventModel = Sequelize.Model<AnalyticsEventInstance, AnalyticsEvent>;

export interface UserInstance extends Sequelize.Instance<Partial<User>> {dataValues: User; }
export type UserModel = Sequelize.Model<UserInstance, User>;

export interface QuestInstance extends Sequelize.Instance<Partial<Quest>> {dataValues: Quest; }
export type QuestModel = Sequelize.Model<QuestInstance, Partial<Quest>>;

export interface QuestDataInstance extends Sequelize.Instance<Partial<QuestData>> {dataValues: QuestData; }
export type QuestDataModel = Sequelize.Model<QuestDataInstance, Partial<QuestData>>;

export interface FeedbackInstance extends Sequelize.Instance<Partial<Feedback>> {dataValues: Feedback; }
export type FeedbackModel = Sequelize.Model<FeedbackInstance, Partial<Feedback>>;

export interface RenderedQuestInstance extends Sequelize.Instance<Partial<RenderedQuest>> {}
export type RenderedQuestModel = Sequelize.Model<RenderedQuestInstance, Partial<RenderedQuest>>;

export interface EventInstance extends Sequelize.Instance<Partial<Event>> {dataValues: Event; }
export type EventModel = Sequelize.Model<EventInstance, Partial<Event>>;

export interface SessionClientInstance extends Sequelize.Instance<Partial<SessionClient>> {dataValues: SessionClient; }
export type SessionClientModel = Sequelize.Model<SessionClientInstance, Partial<SessionClient>>;

export interface SessionInstance extends Sequelize.Instance<Session> {dataValues: Session; }
export type SessionModel = Sequelize.Model<SessionInstance, Session>;

export const AUTH_SESSION_TABLE = 'AuthSession';

export class Database {
  public sequelize: Sequelize.Sequelize;

  public analyticsEvent: AnalyticsEventModel;
  public users: UserModel;
  public quests: QuestModel;
  public questData: QuestDataModel;
  public feedback: FeedbackModel;
  public renderedQuests: RenderedQuestModel;
  public events: EventModel;
  public sessionClients: SessionClientModel;
  public sessions: SessionModel;

  constructor(s: Sequelize.Sequelize) {
    this.sequelize = s;
    this.setupModels();
  }

  private setupModels() {
    const standardOptions = {
      timestamps: true,
      // https://github.com/ExpeditionRPG/api/issues/39
      underscored: true,
    };

    const analyticsEventSpec = toSequelize(new AnalyticsEvent({userID: ''}));
    this.analyticsEvent = this.sequelize.define('analyticsevents', analyticsEventSpec, {
      ...standardOptions,
      freezeTableName: true,
      indexes: [
        {
          fields: ['category', 'action'],
        },
      ],
      timestamps: false, // TODO: eventually switch to sequelize timestamps
    });

    const userSpec = toSequelize(new User({id: ''}));
    this.users = this.sequelize.define('users', userSpec, {
      ...standardOptions,
      timestamps: false, // TODO: eventually switch to sequelize timestamps
      underscored: undefined,
    });

    const questSpec = toSequelize(new Quest({id: '', partition: PUBLIC_PARTITION}));
    this.quests = this.sequelize.define('quests', questSpec, {
      ...standardOptions,
      timestamps: false, // TODO: eventually switch to sequelize timestamps
      indexes: [
        // default search columns
        {
          method: 'BTREE',
          fields: ['published', 'tombstone', 'partition', 'minplayers', 'maxplayers', 'language', 'created'],
        },
      ],
    });

    const questDataSpec = toSequelize(new QuestData({id: '', userid: '', data: '', notes: ''}));
    this.questData = this.sequelize.define('questdata', questDataSpec, {
      ...standardOptions,
      timestamps: false, // TODO: eventually switch to sequelize timestamps
    });

    const feedbackSpec = toSequelize(new Feedback({partition: PUBLIC_PARTITION, questid: '', userid: ''}));
    this.feedback = this.sequelize.define('feedback', feedbackSpec, {
      ...standardOptions,
      freezeTableName: true,
      timestamps: false, // TODO: eventually switch to sequelize timestamps
    });

    const renderedQuestSpec = toSequelize(new RenderedQuest({partition: PUBLIC_PARTITION, id: '', questversion: 0}));
    this.renderedQuests = this.sequelize.define('renderedquests', renderedQuestSpec, standardOptions);

    const eventSpec = toSequelize(new Event({session: 0, timestamp: PLACEHOLDER_DATE, client: '', instance: '', id: 0, type: '', json: ''}));
    this.events = this.sequelize.define('events', eventSpec, standardOptions);

    const sessionClientSpec = toSequelize(new SessionClient({session: 0, client: '', secret: ''}));
    this.sessionClients = this.sequelize.define('sessionclients', sessionClientSpec, standardOptions);

    const sessionSpec = toSequelize(new Session({id: 0, secret: '', eventCounter: 0, locked: false}));
    this.sessions = this.sequelize.define('sessions', sessionSpec, standardOptions);

    // This doesn't need an independent spec - it is used by connect-session-sequelize
    // https://www.npmjs.com/package/connect-session-sequelize
    // We redeclare it here so we can apply a custom name.
    const authSession = this.sequelize.define(AUTH_SESSION_TABLE, {
      data: Sequelize.TEXT,
      expires: Sequelize.DATE,
      sid: {
        primaryKey: true,
        type: Sequelize.STRING(32),
      },
    });
    authSession.sync();
  }
}

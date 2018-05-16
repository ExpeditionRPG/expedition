import Sequelize from 'sequelize'
import {PLACEHOLDER_DATE} from 'expedition-qdl/lib/schema/SchemaBase'
import {AnalyticsEvent} from 'expedition-qdl/lib/schema/AnalyticsEvents'
import {User} from 'expedition-qdl/lib/schema/Users'
import {Quest} from 'expedition-qdl/lib/schema/Quests'
import {PUBLIC_PARTITION} from 'expedition-qdl/lib/schema/Constants'
import {Feedback} from 'expedition-qdl/lib/schema/Feedback'
import {RenderedQuest} from 'expedition-qdl/lib/schema/RenderedQuests'
import {Session} from 'expedition-qdl/lib/schema/multiplayer/Sessions'
import {SessionClient} from 'expedition-qdl/lib/schema/multiplayer/SessionClients'
import {Event} from 'expedition-qdl/lib/schema/multiplayer/Events'
import {toSequelize} from './Schema'

export interface AnalyticsEventInstance extends Sequelize.Instance<Partial<AnalyticsEvent>> {dataValues: AnalyticsEvent};
export type AnalyticsEventModel = Sequelize.Model<AnalyticsEventInstance, AnalyticsEvent>;

export interface UserInstance extends Sequelize.Instance<Partial<User>> {dataValues: User};
export type UserModel = Sequelize.Model<UserInstance, User>;

export interface QuestInstance extends Sequelize.Instance<Partial<Quest>> {dataValues: Quest}
export type QuestModel = Sequelize.Model<QuestInstance, Partial<Quest>>;

export interface FeedbackInstance extends Sequelize.Instance<Partial<Feedback>> {dataValues: Feedback}
export type FeedbackModel = Sequelize.Model<FeedbackInstance, Partial<Feedback>>;

export interface RenderedQuestInstance extends Sequelize.Instance<Partial<RenderedQuest>> {}
export type RenderedQuestModel = Sequelize.Model<RenderedQuestInstance, Partial<RenderedQuest>>;

export interface EventInstance extends Sequelize.Instance<Partial<Event>> {dataValues: Event}
export type EventModel = Sequelize.Model<EventInstance, Partial<Event>>;

export interface SessionClientInstance extends Sequelize.Instance<Partial<SessionClient>> {dataValues: SessionClient}
export type SessionClientModel = Sequelize.Model<SessionClientInstance, Partial<SessionClient>>;

export interface SessionInstance extends Sequelize.Instance<Session> {dataValues: Session}
export type SessionModel = Sequelize.Model<SessionInstance, Session>;

export class Database {
  public sequelize: Sequelize.Sequelize;

  public analyticsEvent: AnalyticsEventModel;
  public users: UserModel;
  public quests: QuestModel;
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
      // https://github.com/ExpeditionRPG/expedition-api/issues/39
      underscored: true,
    };

    const analyticsEventSpec = toSequelize(new AnalyticsEvent({userID: ''}));
    this.analyticsEvent = this.sequelize.define('analyticsevents', analyticsEventSpec, {
      ...standardOptions,
      timestamps: false, // TODO: eventually switch to sequelize timestamps
      freezeTableName: true,
      indexes: [
        {
          fields: ['category', 'action'],
        },
      ],
    });

    const userSpec = toSequelize(new User({id: ''}));
    this.users = this.sequelize.define('users', userSpec, {
      ...standardOptions,
      timestamps: false, // TODO: eventually switch to sequelize timestamps
      underscored: undefined,
    });

    const questSpec = toSequelize(new Quest({id: '', partition: PUBLIC_PARTITION}));
    this.quests = this.sequelize.define('quests', questSpec, standardOptions);

    const feedbackSpec = toSequelize(new Feedback({partition: PUBLIC_PARTITION, questid: '', userid: ''}));
    this.feedback = this.sequelize.define('feedback', feedbackSpec, {
      ...standardOptions,
      timestamps: false, // TODO: eventually switch to sequelize timestamps
      freezeTableName: true,
    });

    const renderedQuestSpec = toSequelize(new RenderedQuest({partition: PUBLIC_PARTITION, id: '', questversion: 0}));
    this.renderedQuests = this.sequelize.define('renderedquests', renderedQuestSpec, standardOptions);

    const eventSpec = toSequelize(new Event({session: 0, timestamp: PLACEHOLDER_DATE, client: '', instance: '', id: 0, type: '', json: ''}));
    this.events = this.sequelize.define('events', eventSpec, standardOptions);

    const sessionClientSpec = toSequelize(new SessionClient({session: 0, client: '', secret: ''}));
    this.sessionClients = this.sequelize.define('sessionclients', sessionClientSpec, standardOptions);

    const sessionSpec = toSequelize(new Session({id: 0, secret: '', eventCounter: 0, locked: false}));
    this.sessions = this.sequelize.define('sessions', sessionSpec, standardOptions);
  }
}

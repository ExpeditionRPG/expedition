import Sequelize from 'sequelize'
import {AnalyticsEvent} from 'expedition-qdl/lib/schema/AnalyticsEvents'
import {User} from 'expedition-qdl/lib/schema/Users'
import {Quest} from 'expedition-qdl/lib/schema/Quests'
import {PUBLIC_PARTITION} from 'expedition-qdl/lib/schema/Constants'
import {Feedback} from 'expedition-qdl/lib/schema/Feedback'
import {RenderedQuest} from 'expedition-qdl/lib/schema/RenderedQuests'
import {Session} from './multiplayer/Sessions'
import {SessionClient} from './multiplayer/SessionClients'
import {Event} from './multiplayer/Events'
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

export interface Models {
  // TODO: migrate these
  Session: Session;
  SessionClient: SessionClient;
  Event: Event;
}

export class Database {
  public models: Models;
  public sequelize: Sequelize.Sequelize;
  public analyticsEvent: AnalyticsEventModel;
  public users: UserModel;
  public quests: QuestModel;
  public feedback: FeedbackModel;
  public renderedQuests: RenderedQuestModel;

  constructor(s: Sequelize.Sequelize) {
    this.sequelize = s;
    this.setupModels();
  }

  private setupModels() {
    const analyticsEventSpec = toSequelize(new AnalyticsEvent({userID: ''}));
    this.analyticsEvent = this.sequelize.define('analyticsevents', analyticsEventSpec, {
      freezeTableName: true,
      timestamps: false, // TODO: eventually switch to sequelize timestamps
      underscored: true,
      indexes: [
        {
          fields: ['category', 'action'],
        },
      ],
    });
    const userSpec = toSequelize(new User({id: ''}));
    this.users = this.sequelize.define('users', userSpec, {
      timestamps: false, // TODO: eventually switch to sequelize timestamps
    });
    const questSpec = toSequelize(new Quest({id: '', partition: PUBLIC_PARTITION}));
    this.quests = this.sequelize.define('quests', questSpec, {
      timestamps: false, // TODO: eventually switch to sequelize timestamps
      // https://github.com/ExpeditionRPG/expedition-api/issues/39
      underscored: true,
    });
    const feedbackSpec = toSequelize(new Feedback({partition: PUBLIC_PARTITION, questid: '', userid: ''}));
    this.feedback = this.sequelize.define('feedback', feedbackSpec, {
      freezeTableName: true,
      timestamps: false, // TODO: eventually switch to sequelize timestamps
      underscored: true,
    });
    const renderedQuestSpec = toSequelize(new RenderedQuest({partition: PUBLIC_PARTITION, id: '', questversion: 0}));
    this.renderedQuests = this.sequelize.define('renderedquests', renderedQuestSpec, {
      timestamps: true,
      // https://github.com/ExpeditionRPG/expedition-api/issues/39
      underscored: true,
    });

    this.models = {
      // For multiplayer:
      Session: new Session(this.sequelize),
      SessionClient: new SessionClient(this.sequelize),
      Event: new Event(this.sequelize),
    };

    // Associate models with each other
    for (const k of Object.keys(this.models)) {
      (this.models as any)[k].associate(this.models);
    }
  }
}

import * as Sequelize from 'sequelize';
import { AnalyticsEvent } from 'shared/schema/AnalyticsEvents';
import { Partition } from 'shared/schema/Constants';
import { Feedback } from 'shared/schema/Feedback';
import { Event } from 'shared/schema/multiplayer/Events';
import { SessionClient } from 'shared/schema/multiplayer/SessionClients';
import { Session } from 'shared/schema/multiplayer/Sessions';
import { QuestData } from 'shared/schema/QuestData';
import { Quest } from 'shared/schema/Quests';
import { RenderedQuest } from 'shared/schema/RenderedQuests';
import { PLACEHOLDER_DATE } from 'shared/schema/SchemaBase';
import { UserBadge } from 'shared/schema/UserBadges';
import { User } from 'shared/schema/Users';
import { toSequelize } from './Schema';

export interface AnalyticsEventInstance
  extends Sequelize.Model<Partial<AnalyticsEvent>> {
  dataValues: AnalyticsEvent;
}
type AnalyticsEventModel = {
  new (): AnalyticsEventInstance;
} & typeof Sequelize.Model;

export interface UserInstance extends Sequelize.Model<Partial<User>> {
  dataValues: User;
}
export type UserModel = {
  new (): UserInstance;
} & typeof Sequelize.Model;

export interface UserBadgeInstance extends Sequelize.Model<Partial<UserBadge>> {
  dataValues: UserBadge;
}
export type UserBadgeModel = {
  new (): UserBadgeInstance;
} & typeof Sequelize.Model;

export interface QuestInstance extends Sequelize.Model<Partial<Quest>> {
  dataValues: Quest;
}
export type QuestModel = {
  new (): QuestInstance;
} & typeof Sequelize.Model;

export interface QuestDataInstance extends Sequelize.Model<Partial<QuestData>> {
  dataValues: QuestData;
}
export type QuestDataModel = {
  new (): QuestDataInstance;
} & typeof Sequelize.Model;

export interface FeedbackInstance extends Sequelize.Model<Partial<Feedback>> {
  dataValues: Feedback;
}
export type FeedbackModel = {
  new (): FeedbackInstance;
} & typeof Sequelize.Model;

export interface RenderedQuestInstance
  extends Sequelize.Model<Partial<RenderedQuest>> {}
export type RenderedQuestModel = {
  new (): RenderedQuestInstance;
} & typeof Sequelize.Model;

export interface EventInstance extends Sequelize.Model<Partial<Event>> {
  dataValues: Event;
}
export type EventModel = {
  new (): EventInstance;
} & typeof Sequelize.Model;

export interface SessionClientInstance
  extends Sequelize.Model<Partial<SessionClient>> {
  dataValues: SessionClient;
}
export type SessionClientModel = {
  new (): SessionClientInstance;
} & typeof Sequelize.Model;

export interface SessionInstance extends Sequelize.Model<Session> {
  dataValues: Session;
}
export type SessionModel = {
  new (): SessionInstance;
} & typeof Sequelize.Model;

export const AUTH_SESSION_TABLE = 'AuthSession';

export class Database {
  public sequelize: Sequelize.Sequelize;

  public analyticsEvent: AnalyticsEventModel;
  public users: UserModel;
  public userBadges: UserBadgeModel;
  public quests: QuestModel;
  public questData: QuestDataModel;
  public feedback: FeedbackModel;
  public renderedQuests: RenderedQuestModel;
  public events: EventModel;
  public sessionClients: SessionClientModel;
  public sessions: SessionModel;
  public authSession: any;

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

    const analyticsEventSpec = toSequelize(new AnalyticsEvent({ userID: '' }));
    this.analyticsEvent = this.sequelize.define(
      'analyticsevents',
      analyticsEventSpec,
      {
        ...standardOptions,
        freezeTableName: true,
        indexes: [
          {
            fields: ['category', 'action'],
          },
        ],
        timestamps: false, // TODO: eventually switch to sequelize timestamps
      }
    ) as AnalyticsEventModel;
    // this.analyticsEvent.sync();

    const userSpec = toSequelize(new User({ id: '' }));
    this.users = this.sequelize.define('users', userSpec, {
      ...standardOptions,
      timestamps: false, // TODO: eventually switch to sequelize timestamps
      underscored: undefined,
    }) as UserModel;
    // this.users.sync();

    const userBadgeSpec = toSequelize(
      new UserBadge({ userid: '', badge: 'backer1' })
    );
    this.userBadges = this.sequelize.define('userbadges', userBadgeSpec, {
      ...standardOptions,
      timestamps: false, // TODO: eventually switch to sequelize timestamps
      underscored: undefined,
    }) as UserBadgeModel;
    // this.userBadges.sync();

    const questSpec = toSequelize(
      new Quest({ id: '', partition: Partition.expeditionPublic })
    );
    this.quests = this.sequelize.define('quests', questSpec, {
      ...standardOptions,
      timestamps: false, // TODO: eventually switch to sequelize timestamps
      indexes: [
        // default search columns
        {
          using: 'BTREE',
          fields: [
            'published',
            'tombstone',
            'partition',
            'minplayers',
            'maxplayers',
            'language',
            'created',
          ],
        },
      ],
    }) as QuestModel;
    // this.quests.sync();

    const questDataSpec = toSequelize(
      new QuestData({
        id: '',
        userid: '',
        data: '',
        notes: '',
        metadata: '',
        edittime: new Date(0),
      })
    );
    this.questData = this.sequelize.define('questdata', questDataSpec, {
      ...standardOptions,
      timestamps: false, // TODO: eventually switch to sequelize timestamps
    }) as QuestDataModel;
    // this.questData.sync();

    const feedbackSpec = toSequelize(
      new Feedback({
        partition: Partition.expeditionPublic,
        questid: '',
        userid: '',
      })
    );
    this.feedback = this.sequelize.define('feedback', feedbackSpec, {
      ...standardOptions,
      freezeTableName: true,
      timestamps: false, // TODO: eventually switch to sequelize timestamps
    }) as FeedbackModel;
    // this.feedback.sync();

    const renderedQuestSpec = toSequelize(
      new RenderedQuest({
        partition: Partition.expeditionPublic,
        id: '',
        questversion: 0,
      })
    );
    this.renderedQuests = this.sequelize.define(
      'renderedquests',
      renderedQuestSpec,
      standardOptions
    ) as RenderedQuestModel;
    // this.renderedQuests.sync();

    const eventSpec = toSequelize(
      new Event({
        session: 0,
        timestamp: PLACEHOLDER_DATE,
        client: '',
        instance: '',
        id: 0,
        type: '',
        json: '',
      })
    );
    this.events = this.sequelize.define(
      'events',
      eventSpec,
      standardOptions
    ) as EventModel;
    // this.events.sync();

    const sessionClientSpec = toSequelize(
      new SessionClient({ session: 0, client: '', secret: '' })
    );
    this.sessionClients = this.sequelize.define(
      'sessionclients',
      sessionClientSpec,
      standardOptions
    ) as SessionClientModel;
    // this.sessionClients.sync();

    const sessionSpec = toSequelize(
      new Session({ id: 0, secret: '', eventCounter: 0, locked: false })
    );
    this.sessions = this.sequelize.define(
      'sessions',
      sessionSpec,
      standardOptions
    ) as SessionModel;
    // this.sessions.sync();

    // This doesn't need an independent spec - it is used by connect-session-sequelize
    // https://www.npmjs.com/package/connect-session-sequelize
    // We redeclare it here so we can apply a custom name.
    this.authSession = this.sequelize.define(AUTH_SESSION_TABLE, {
      data: Sequelize.TEXT,
      expires: Sequelize.DATE,
      sid: {
        primaryKey: true,
        type: Sequelize.STRING(32),
      },
    });
    // this.authSession.sync();
  }
}

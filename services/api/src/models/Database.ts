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
import { PLACEHOLDER_DATE, SchemaBase } from 'shared/schema/SchemaBase';
import { UserBadge } from 'shared/schema/UserBadges';
import { User } from 'shared/schema/Users';
import { toSequelize } from './Schema';

// The column half of a schema class: its data fields, minus the SchemaBase
// bookkeeping and the withoutDefaults() helper, none of which exist on a
// Sequelize instance. Mixing this into each *Instance interface is what makes
// `instance.get('partition')` return a string: Sequelize types the string
// overload of get() as `unknown` and only the `K extends keyof this` overload
// is precise, so the columns have to be visible on `this`.
type Columns<T> = Omit<T, keyof SchemaBase | 'withoutDefaults'>;

// Every `*Model` type below is written `typeof Sequelize.Model & {new(): I}`
// and the order matters. Sequelize's statics are declared with a polymorphic
// `this: {new(): M} & typeof Model`, and with the object literal written first
// TypeScript 6 resolves `M` against `typeof Model`'s own construct signature
// instead of ours -- every `findOne`/`findAll`/`create` then comes back as
// `Model<unknown, unknown>` and loses `dataValues`. With `typeof Model` first,
// `M` infers as the instance interface, which is the whole point of these
// aliases.

export interface AnalyticsEventInstance
  extends Sequelize.Model<Partial<AnalyticsEvent>>,
    Columns<AnalyticsEvent> {
  dataValues: AnalyticsEvent;
}
type AnalyticsEventModel = typeof Sequelize.Model & {
  new (): AnalyticsEventInstance;
};

export interface UserInstance
  extends Sequelize.Model<Partial<User>>,
    Columns<User> {
  dataValues: User;
}
export type UserModel = typeof Sequelize.Model & {
  new (): UserInstance;
};

export interface UserBadgeInstance
  extends Sequelize.Model<Partial<UserBadge>>,
    Columns<UserBadge> {
  dataValues: UserBadge;
}
export type UserBadgeModel = typeof Sequelize.Model & {
  new (): UserBadgeInstance;
};

export interface QuestInstance
  extends Sequelize.Model<Partial<Quest>>,
    Columns<Quest> {
  dataValues: Quest;
}
export type QuestModel = typeof Sequelize.Model & {
  new (): QuestInstance;
};

export interface QuestDataInstance
  extends Sequelize.Model<Partial<QuestData>>,
    Columns<QuestData> {
  dataValues: QuestData;
}
export type QuestDataModel = typeof Sequelize.Model & {
  new (): QuestDataInstance;
};

export interface FeedbackInstance
  extends Sequelize.Model<Partial<Feedback>>,
    Columns<Feedback> {
  dataValues: Feedback;
}
export type FeedbackModel = typeof Sequelize.Model & {
  new (): FeedbackInstance;
};

export interface RenderedQuestInstance
  extends Sequelize.Model<Partial<RenderedQuest>>,
    Columns<RenderedQuest> {}
export type RenderedQuestModel = typeof Sequelize.Model & {
  new (): RenderedQuestInstance;
};

export interface EventInstance
  extends Sequelize.Model<Partial<Event>>,
    Columns<Event> {
  dataValues: Event;
}
export type EventModel = typeof Sequelize.Model & {
  new (): EventInstance;
};

export interface SessionClientInstance
  extends Sequelize.Model<Partial<SessionClient>>,
    Columns<SessionClient> {
  dataValues: SessionClient;
}
export type SessionClientModel = typeof Sequelize.Model & {
  new (): SessionClientInstance;
};

export interface SessionInstance
  extends Sequelize.Model<Session>,
    Columns<Session> {
  dataValues: Session;
}
export type SessionModel = typeof Sequelize.Model & {
  new (): SessionInstance;
};

export const AUTH_SESSION_TABLE = 'AuthSession';

export class Database {
  public sequelize: Sequelize.Sequelize;

  public analyticsEvent!: AnalyticsEventModel;
  public users!: UserModel;
  public userBadges!: UserBadgeModel;
  public quests!: QuestModel;
  public questData!: QuestDataModel;
  public feedback!: FeedbackModel;
  public renderedQuests!: RenderedQuestModel;
  public events!: EventModel;
  public sessionClients!: SessionClientModel;
  public sessions!: SessionModel;
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
      },
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
      new UserBadge({ userid: '', badge: 'backer1' }),
    );
    this.userBadges = this.sequelize.define('userbadges', userBadgeSpec, {
      ...standardOptions,
      timestamps: false, // TODO: eventually switch to sequelize timestamps
      underscored: undefined,
    }) as UserBadgeModel;
    // this.userBadges.sync();

    const questSpec = toSequelize(
      new Quest({ id: '', partition: Partition.expeditionPublic }),
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
      }),
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
      }),
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
      }),
    );
    this.renderedQuests = this.sequelize.define(
      'renderedquests',
      renderedQuestSpec,
      standardOptions,
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
      }),
    );
    this.events = this.sequelize.define(
      'events',
      eventSpec,
      standardOptions,
    ) as EventModel;
    // this.events.sync();

    const sessionClientSpec = toSequelize(
      new SessionClient({ session: 0, client: '', secret: '' }),
    );
    this.sessionClients = this.sequelize.define(
      'sessionclients',
      sessionClientSpec,
      standardOptions,
    ) as SessionClientModel;
    // this.sessionClients.sync();

    const sessionSpec = toSequelize(
      new Session({ id: 0, secret: '', eventCounter: 0, locked: false }),
    );
    this.sessions = this.sequelize.define(
      'sessions',
      sessionSpec,
      standardOptions,
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

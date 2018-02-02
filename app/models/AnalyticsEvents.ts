import * as Sequelize from 'sequelize'
import * as Promise from 'bluebird'
import {Quest} from './Quests'

export interface AnalyticsEventAttributes {
  category: string;
  action: string;
  quest_id?: string|null;
  user_id?: string|null;
  quest_version?: number|null;
  created?: Date|null;
  difficulty?: string|null;
  platform?: string|null;
  players?: number|null;
  version?: string|null;
  json?: string|null;
}

export interface AnalyticsEventInstance extends Sequelize.Instance<AnalyticsEventAttributes> {
  dataValues: AnalyticsEventAttributes;
}

export type AnalyticsEventModel = Sequelize.Model<AnalyticsEventInstance, AnalyticsEventAttributes>;

export class AnalyticsEvent {
  protected s: Sequelize.Sequelize;
  public model: AnalyticsEventModel;
  protected quest: Quest;

  constructor(s: Sequelize.Sequelize) {
    this.s = s;
    this.model = this.s.define<AnalyticsEventInstance, AnalyticsEventAttributes>('analyticsevents', {
      category: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      action: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      quest_id: Sequelize.STRING(255),
      user_id: {
        type: Sequelize.STRING(255),
        primaryKey: true,
      },
      quest_version: Sequelize.INTEGER,
      created: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        primaryKey: true,
      },
      difficulty: Sequelize.STRING(32),
      platform: Sequelize.STRING(32),
      players: Sequelize.INTEGER,
      version: Sequelize.STRING(32),
      json: Sequelize.TEXT,
    }, {
      freezeTableName: true,
      timestamps: false, // TODO: eventually switch to sequelize timestamps
      underscored: true,
      indexes: [
        {
          fields: ['category', 'action'],
        },
      ],
    });
  }

  public associate(models: {Quest: Quest}) {
    this.quest = models.Quest;
  }

  public create(AnalyticsEvent: AnalyticsEventAttributes): Promise<any> {
    return this.s.authenticate()
      .then(() => {
        return this.model.create(AnalyticsEvent);
      })
      .catch((err: Error) => {
        throw err;
      });
  }
}

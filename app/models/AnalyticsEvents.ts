import * as Sequelize from 'sequelize'
import * as Promise from 'bluebird'
import {Quest} from './Quests'
import {AnalyticsEvent as AnalyticsEventAttributes} from 'expedition-qdl/lib/schema/AnalyticsEvents'
import {toSequelize} from './Schema'

export interface AnalyticsEventInstance extends Sequelize.Instance<AnalyticsEventAttributes> {
  dataValues: AnalyticsEventAttributes;
}

const SequelizeAnalyticsEvent = toSequelize(new AnalyticsEventAttributes({userID: ''}));

export type AnalyticsEventModel = Sequelize.Model<AnalyticsEventInstance, AnalyticsEventAttributes>;

export class AnalyticsEvent {
  protected s: Sequelize.Sequelize;
  public model: AnalyticsEventModel;
  protected quest: Quest;

  constructor(s: Sequelize.Sequelize) {
    this.s = s;
    this.model = this.s.define<AnalyticsEventInstance, AnalyticsEventAttributes>('analyticsevents',
      SequelizeAnalyticsEvent,
      {
        freezeTableName: true,
        timestamps: false, // TODO: eventually switch to sequelize timestamps
        underscored: true,
        indexes: [
          {
            fields: ['category', 'action'],
          },
        ],
      }
    );
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

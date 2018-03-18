import * as Sequelize from 'sequelize'
import {AnalyticsEvent, AnalyticsEventModel} from './AnalyticsEvents'
import {Feedback, FeedbackModel} from './Feedback'
import {User, UserModel} from './Users'
import {Quest, QuestModel} from './Quests'
import {Session} from './remoteplay/Sessions'
import {SessionClient} from './remoteplay/SessionClients'
import {Event} from './remoteplay/Events'

import Config from '../config'
const Url = require('url');

export interface Models {
  AnalyticsEvent: AnalyticsEvent;
  Feedback: Feedback;
  User: User;
  Quest: Quest;
  Session: Session;
  SessionClient: SessionClient;
  Event: Event;
}

class Database {
  private models: Models;
  private sequelize: Sequelize.Sequelize;

  constructor(s?: Sequelize.Sequelize) {
    if (!s) {
      this.sequelize = new Sequelize(Config.get('DATABASE_URL'), {
        dialectOptions: {
          ssl: true,
        },
        logging: Config.get('SEQUELIZE_LOGGING'),
      });
    } else {
      this.sequelize = s;
    }

    this.models = {
      AnalyticsEvent: new AnalyticsEvent(this.sequelize),
      Feedback: new Feedback(this.sequelize),
      Quest: new Quest(this.sequelize),
      User: new User(this.sequelize),

      // For remote play:
      Session: new Session(this.sequelize),
      SessionClient: new SessionClient(this.sequelize),
      Event: new Event(this.sequelize),
    };

    // Associate models with each other
    for (const k of Object.keys(this.models)) {
      (this.models as any)[k].associate(this.models);
    }
  }

  getModels(): Models {
    return this.models;
  }

  getSequelize() {
    return this.sequelize;
  }
}

const database = new Database();
export const models = database.getModels();
export const sequelize = database.getSequelize();

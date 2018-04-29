import * as Sequelize from 'sequelize'
import {AnalyticsEvent} from './AnalyticsEvents'
import {Feedback} from './Feedback'
import {User} from './Users'
import {Quest} from './Quests'
import {RenderedQuest} from './RenderedQuests'
import {Session} from './multiplayer/Sessions'
import {SessionClient} from './multiplayer/SessionClients'
import {Event} from './multiplayer/Events'

import Config from '../config'

export interface Models {
  AnalyticsEvent: AnalyticsEvent;
  Feedback: Feedback;
  User: User;
  Quest: Quest;
  RenderedQuest: RenderedQuest;
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
        logging: (Config.get('SEQUELIZE_LOGGING') === 'true'),
      });
    } else {
      this.sequelize = s;
    }

    this.models = {
      AnalyticsEvent: new AnalyticsEvent(this.sequelize),
      Feedback: new Feedback(this.sequelize),
      Quest: new Quest(this.sequelize),
      RenderedQuest: new RenderedQuest(this.sequelize),
      User: new User(this.sequelize),

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

import * as Sequelize from 'sequelize'
import {User, UserModel} from './Users'
import {Quest, QuestModel} from './Quests'
import {Feedback, FeedbackModel} from './Feedback'

import Config from '../config'
const Url = require('url');

export interface Models {
  User: User;
  Quest: Quest;
  Feedback: Feedback;
}

class Database {
  private models: Models;
  private sequelize: Sequelize.Sequelize;

  constructor(s?: Sequelize.Sequelize) {
    if (!s) {
      this.sequelize = new Sequelize(Config.get('DATABASE_URL'), {
        logging: true,
        dialectOptions: {
          ssl: true,
        },
      });
    } else {
      this.sequelize = s;
    }

    this.models = {
      User: new User(this.sequelize),
      Quest: new Quest(this.sequelize),
      Feedback: new Feedback(this.sequelize),
    };

    // Associate models with each other
    for (let k of Object.keys(this.models)) {
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

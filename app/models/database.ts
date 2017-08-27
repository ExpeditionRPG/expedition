import * as Sequelize from 'sequelize'
import {User, UserModel} from './users'
import {Quest, QuestModel} from './quests'
import {Feedback, FeedbackModel} from './feedback'

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
      const urlparams = Url.parse(Config.get('DATABASE_URL'));
      const userauth = urlparams.auth.split(':');
      const dbName = urlparams.pathname.split('/')[1];
      const poolConfig = {
        user: userauth[0],
        password: userauth[1],
        host: urlparams.hostname,
        port: urlparams.port,
        database: urlparams.pathname.split('/')[1],
        ssl: true,
      };

      this.sequelize = new Sequelize(dbName, userauth[0], userauth[1], {
        host: urlparams.hostname,
        dialect: 'postgres',
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
      this.models[k].associate(this.models);
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

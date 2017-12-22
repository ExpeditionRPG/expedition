import Config from '../config'
import * as Sequelize from 'sequelize'
import * as Bluebird from 'bluebird'
const Mailchimp = require('mailchimp-api-v3');
const mailchimp = (Config.get('NODE_ENV') !== 'dev' && Config.get('MAILCHIMP_KEY')) ? new Mailchimp(Config.get('MAILCHIMP_KEY')) : null;

export interface UserAttributes {
  id: string;
  email: string;
  name: string;
  loot_points: number;
  created: Date;
  login_count: number;
  last_login: Date;
}

export interface UserInstance extends Sequelize.Instance<UserAttributes> {
  dataValues: UserAttributes;
}

export type UserModel = Sequelize.Model<UserInstance, UserAttributes>;

export class User {
  protected s: Sequelize.Sequelize;
  protected mc: any;
  public model: UserModel;

  constructor(s: Sequelize.Sequelize, mc?: any) {
    this.s = s;
    this.mc = mc || mailchimp;
    this.model = (this.s.define('users', {
      id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING(255),
        validate: {
          isEmail: true,
        }
      },
      name: Sequelize.STRING(255),
      loot_points: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created: Sequelize.DATE,
      login_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      last_login: Sequelize.DATE,
    }, {
      timestamps: false, // TODO: eventually switch to sequelize timestamps
    }) as UserModel);
  }

  public associate(models: any) {}

  public upsert(user: UserAttributes): Bluebird<UserAttributes> {
    return this.s.authenticate()
      .then(() => {return this.model.upsert(user)})
      .then((created: Boolean) => {
        if (created && this.mc) {
          return this.mc.post('/lists/' + Config.get('MAILCHIMP_CREATORS_LIST_ID') + '/members/', {
            email_address: user.email,
            status: 'subscribed',
          });
        }
      })
      .then((subscribed: Boolean) => {
        if (subscribed) {
          console.log(user.email + ' subscribed to creators list');
        }
      })
      .then(() => {return this.model.findOne({where: {id: user.id}})})
      .then((result: UserInstance) => {
        result.increment('login_count');
        return result.dataValues;
      });
  }

  public get(id: string): Bluebird<UserAttributes> {
    return this.s.authenticate()
      .then(() => {return this.model.findOne({where: {id}})})
      .then((result: UserInstance) => {return result.dataValues});
  }
}


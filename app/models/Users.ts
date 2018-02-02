import Config from '../config'
import * as Sequelize from 'sequelize'
import * as Bluebird from 'bluebird'
import {AnalyticsEvent, AnalyticsEventAttributes, AnalyticsEventInstance} from './AnalyticsEvents'
const Mailchimp = require('mailchimp-api-v3');
const mailchimp = (Config.get('NODE_ENV') !== 'dev' && Config.get('MAILCHIMP_KEY')) ? new Mailchimp(Config.get('MAILCHIMP_KEY')) : null;

export interface UserAttributes {
  id: string;
  email?: string|null;
  name?: string|null;
  loot_points?: number|null;
  created?: Date|null;
  login_count?: number|null;
  last_login?: Date|null;
  quest_plays: {[id: string]: Date}; // TODO: this is not a value in the User table and shouldn't be an attribute.
}

export interface UserInstance extends Sequelize.Instance<UserAttributes> {
  dataValues: UserAttributes;
}

export type UserModel = Sequelize.Model<UserInstance, UserAttributes>;

export class User {
  protected ae: AnalyticsEvent;
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

  public associate(models: {AnalyticsEvent: AnalyticsEvent}) {
    this.ae = models.AnalyticsEvent;
  }

  public upsert(user: UserAttributes): Bluebird<UserAttributes> {
    // TODO: refactor this - upsert shouldn't be subscribing people to a mailing list, or 
    // calculating derived values and returning them.
    // https://github.com/ExpeditionRPG/expedition-api/issues/70
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
        user = result.dataValues;
      })
      .then(() => {
        return this.ae.model.findAll({
          attributes: ['quest_id', [Sequelize.fn('MAX', Sequelize.col('created')), 'last_played']],
          where: {user_id: user.id, category: 'quest', action: 'end'},
          group: 'quest_id',
        })
      })
      .then((results: any[]) => {
        user.quest_plays = {} as {[id: string]: Date};
        (results || []).forEach((result: any) => { 
          user.quest_plays[result.dataValues['quest_id']] = result.dataValues['last_played']; 
        });
        return user;
      });
  }

  public get(id: string): Bluebird<UserAttributes> {
    return this.s.authenticate()
      .then(() => {return this.model.findOne({where: {id}})})
      .then((result: UserInstance) => {return result.dataValues});
  }
}


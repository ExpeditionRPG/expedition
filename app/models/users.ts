import Config from '../config'
import * as Sequelize from 'sequelize'

const Mailchimp = require('mailchimp-api-v3');
const mailchimp = (Config.get('NODE_ENV') !== 'dev' && Config.get('MAILCHIMP_KEY')) ? new Mailchimp(Config.get('MAILCHIMP_KEY')) : null;

export interface UserAttributes {
  id: string;
  email: string;
  name: string;
  created: Date;
  lastLogin: Date;
}

export interface UserInstance extends Sequelize.Instance<UserAttributes> {
  dataValues: UserAttributes;
}

export type UserModel = Sequelize.Model<UserInstance, UserAttributes>;

export class User {
  private s: Sequelize.Sequelize;
  private mc: any;
  public model: UserModel;

  constructor(s: Sequelize.Sequelize, mc?: any) {
    this.s = s;
    this.mc = mc || mailchimp;
    this.model = (this.s.define('users', {
      id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        validate: {
          max: 255,
        },
      },
      email: {
        type: Sequelize.STRING,
        validate: {
          isEmail: true,
        }
      },
      name: {
        type: Sequelize.STRING,
        validate: {
          max: 255,
        },
      },
      created: Sequelize.DATE,
      lastLogin: Sequelize.DATE,
    }, {
      timestamps: false, // TODO: eventually switch to sequelize timestamps
      underscored: true,
    }) as UserModel);
  }

  public upsert(user: UserAttributes): Promise<any> {
    let u: UserInstance = null;

    return this.s.authenticate()
      .then(() => {return this.model.create(user)})
      .then((user: UserInstance) => {
        u = user;
        if (this.mc) {
          return this.mc.post('/lists/' + Config.get('MAILCHIMP_CREATORS_LIST_ID') + '/members/', {
            email_address: u.dataValues.email,
            status: 'subscribed',
          });
        }
      })
      .then((result: any) => {
        console.log(u.dataValues.email + ' subscribed to creators list');
      });
  }

  public get(id: string): Promise<UserInstance> {
    return this.s.authenticate()
      .then(() => {return this.model.findAll({where: [{id}]})})
      .then((results: UserInstance[]) => {
        if (results.length !== 1) {
          throw new Error("Expected single result for user; got " + results.length);
        }
        return results[0];
      });
  }
}


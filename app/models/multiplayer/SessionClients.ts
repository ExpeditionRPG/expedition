import * as Sequelize from 'sequelize'
import * as Bluebird from 'bluebird'
import {Event} from './Events'
import {SessionClient as SessionClientAttributes} from 'expedition-qdl/lib/schema/multiplayer/SessionClients'
import {toSequelize} from './Schema'

const SessionClientSequelize = toSequelize(new SessionClient({session: 0, client: '', secret: ''}));

export interface SessionClientInstance extends Sequelize.Instance<Partial<SessionClientAttributes>> {
  dataValues: SessionClientAttributes;
}

export type SessionClientModel = Sequelize.Model<SessionClientInstance, Partial<SessionClientAttributes>>;

export class SessionClient {
  protected s: Sequelize.Sequelize;
  public model: SessionClientModel;
  private event: Event;

  constructor(s: Sequelize.Sequelize) {
    this.s = s;
    this.model = (this.s.define('sessionclients', SessionClientSequelize, {
      timestamps: true,
      underscored: true,
    }) as SessionClientModel);
  }

  public associate(models: any) {
    this.event = models.Event;
  }

  public get(session: number, client: string): Bluebird<SessionClientInstance> {
    return this.s.authenticate()
      .then(() => {
        return this.model.findOne({where: {session, client}});
      })
      .then((result: SessionClientInstance) => {
        if (!result) {
          throw new Error('SessionClient not found');
        }
        return result;
      });
  }

  public verify(session: number, client: string, secret: string): Bluebird<boolean> {
    return this.s.authenticate()
      .then(() => {
        return this.model.findOne({where: {session, client, secret}});
      })
      .then((result: SessionClientInstance) => {
        if (!result) {
          return false;
        }
        return true;
      });
  }

  public upsert(session: number, client: string, secret: string): Bluebird<boolean> {
    return this.model.upsert({session, client, secret});
  }

  public getSessionsByClient(client: string): Bluebird<SessionClientInstance[]> {
    return this.s.authenticate()
      .then(() => {
        return this.model.findAll({
          where: {client},
          order: [['updated_at', 'DESC']],
          limit: 5,
        });
      });
  }
}


import * as Sequelize from 'sequelize'
import * as Bluebird from 'bluebird'
import {Event, EventInstance} from './Events'

export interface SessionClientAttributes {
  session: number;
  client: string;
  secret: string;
  created_at?: Date|null;
}

export interface SessionClientInstance extends Sequelize.Instance<SessionClientAttributes> {
  dataValues: SessionClientAttributes;
}

export type SessionClientModel = Sequelize.Model<SessionClientInstance, SessionClientAttributes>;

export class SessionClient {
  protected s: Sequelize.Sequelize;
  public model: SessionClientModel;
  private event: Event;

  constructor(s: Sequelize.Sequelize) {
    this.s = s;
    this.model = (this.s.define('SessionClients', {
      session: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      client: {
        type: Sequelize.STRING(255),
        allowNull: false,
        primaryKey: true,
      },
      secret: {
        type: Sequelize.STRING(32),
        allowNull: false,
        primaryKey: true,
      }
    }, {
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

  public getSessionsByClient(client: string): Bluebird<EventInstance[]> {
    return this.s.authenticate()
      .then(() => {
        return this.model.findAll({
          where: {client},
          order: [['created_at', 'DESC']],
          limit: 10,
        });
      })
      .then((results: SessionClientInstance[]) => {
        return Promise.all(results.map((r) => {
          // Get last action on this session
          const result: any = {session: r.dataValues.session};
          return this.event.getLast(result.session);
        }));
      })
      .then((events: (EventInstance|null)[]) => {
        return events.filter((e: EventInstance|null): e is EventInstance => {
          return e !== null;
        });
      });;
  }
}


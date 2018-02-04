import * as Sequelize from 'sequelize'
import * as Bluebird from 'bluebird'
import {SessionClient} from './SessionClients'
import {Event} from './Events'
import {RemotePlayEvent} from 'expedition-qdl/lib/remote/Events'
import {makeSecret} from 'expedition-qdl/lib/remote/Session'

export interface SessionAttributes {
  id: number;
  secret: string;
  eventCounter: number;
  locked: boolean;
}

export interface SessionInstance extends Sequelize.Instance<SessionAttributes> {
  dataValues: SessionAttributes;
}

export type SessionModel = Sequelize.Model<SessionInstance, SessionAttributes>;

export class Session {
  protected s: Sequelize.Sequelize;
  public model: SessionModel;
  private sessionClient: SessionClient;
  private event: Event;

  constructor(s: Sequelize.Sequelize) {
    this.s = s;
    this.model = (this.s.define('Sessions', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      secret: {
        type: Sequelize.STRING(32),
        allowNull: false,
      },
      eventCounter: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      locked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      }
    }, {
      timestamps: true,
      underscored: true,
    }) as SessionModel);
  }

  public associate(models: any) {
    this.sessionClient = models.SessionClient;
    this.event = models.Event;
  }

  public get(id: string): Bluebird<SessionInstance> {
    return this.s.authenticate()
      .then(() => {
        return this.model.findOne({where: {id}})
      })
      .then((result: SessionInstance) => {
        if (!result) {
          throw new Error('Session not found');
        }
        return result;
      });
  }

  public getBySecret(secret: string): Bluebird<SessionInstance> {
    return this.s.authenticate()
      .then(() => {
        return this.model.findOne({where: {secret, locked: false}});
      })
      .then((result: SessionInstance) => {
        if (!result) {
          throw new Error('Session not found');
        }
        return result;
      });
  }

  public create(): Bluebird<SessionInstance> {
    return this.model.create({
      id: Date.now(),
      secret: makeSecret(),
      eventCounter: 0,
      locked: false,
    });
  }

  public commitEvent(session: number, client: string, event: number|null, type: string, json: string): Bluebird<number|null> {
    return this.s.transaction((txn: Sequelize.Transaction) => {
      return this.model.findOne({where: {id: session}, transaction: txn})
        .then((s: SessionInstance) => {
          if (!s) {
            throw new Error('unknown session');
          }
          if (event === null) {
            event = s.dataValues.eventCounter + 1;
          } else if ((s.dataValues.eventCounter + 1) !== event) {
            throw new Error('eventCounter increment mismatch');
          }
          return s.update({eventCounter: event}, {transaction: txn});
        })
        .then(() => {
          return this.event.model.upsert({
            session,
            client,
            timestamp: new Date(),
            id: (event !== null) ? event : undefined,
            type,
            json,
          }, {transaction: txn});
        });
    }).then(() => {
      return event;
    });
  }
}


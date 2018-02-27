import * as Sequelize from 'sequelize'
import * as Bluebird from 'bluebird'
import {SessionClient} from './SessionClients'
import {Event, EventInstance} from './Events'
import {RemotePlayEvent} from 'expedition-qdl/lib/remote/Events'
import {makeSecret} from 'expedition-qdl/lib/remote/Session'

export interface SessionAttributes {
  id: number;
  secret: string;
  eventCounter: number;
  locked: boolean;
}

export interface SessionInstance extends Sequelize.Instance<SessionAttributes> {}

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

  public getLargestEventID(session: number): Bluebird<number> {
    return this.event.getLast(session).then((e: EventInstance|null) => {
      if (e === null) {
        return 0;
      }
      return parseInt(e.get('id'), 10);
    });
  }

  public getOrderedAfter(session: number, start: number): Bluebird<EventInstance[]> {
    return this.event.getOrderedAfter(session, start);
  }

  public commitEvent(session: number, client: string, instance: string, event: number|null, type: string, json: string): Bluebird<number|null> {
    let s: SessionInstance;
    return this.s.transaction((txn: Sequelize.Transaction) => {
      return this.model.findOne({where: {id: session}, transaction: txn})
        .then((sessionInstance: SessionInstance) => {
          if (!sessionInstance) {
            throw new Error('unknown session');
          }
          s = sessionInstance;
          if (event !== null) {
            return this.event.getById(session, event);
          } else {
            return null;
          }
        })
        .then((eventInstance: EventInstance|null) => {
          if (event === null) {
            // Events created by the server (e.g. "combat timer stop")
            // are assigned event IDs here.
            event = s.get('eventCounter') + 1;
          } else if (eventInstance !== null &&
              eventInstance.get('client') === client &&
              eventInstance.get('instance') === instance &&
              eventInstance.get('type') === type &&
              eventInstance.get('json') === json) {
            // The client does retry requests - if we've already successfully
            // committed this event, return success and don't try to commit it again.
            console.log('Trivial txn: ' + event + ' already committed for client ' + client + ' instance ' + instance);
            return false;
          } else if ((s.get('eventCounter') + 1) !== event) {
            throw new Error('eventCounter increment mismatch');
          }
          return s.update({eventCounter: event}, {transaction: txn}).then(() => {return true;});
        })
        .then((incremented: boolean) => {
          if (!incremented) {
            // Skip upsert if we didn't increment the event counter
            return false;
          }
          if (event === null) {
            throw new Error('Found null event after it should be set');
          }
          return this.event.model.upsert({
            session,
            client,
            instance,
            timestamp: new Date(),
            id: event,
            type,
            json,
          }, {transaction: txn});
        });
    }).then((updated: boolean) => {
      return (updated) ? event : null;
    });
  }
}


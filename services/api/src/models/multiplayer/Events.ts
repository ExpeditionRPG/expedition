import Bluebird from 'bluebird';
import Sequelize from 'sequelize';
import {
  ActionEvent,
  ClientID,
  MultiplayerEvent,
} from 'shared/multiplayer/Events';
import Config from '../../config';
import { broadcast } from '../../multiplayer/Websockets';
import { Database, EventInstance, SessionInstance } from '../Database';

const { Op } = Sequelize;

export function getLastEvent(
  db: Database,
  session: number
): Bluebird<EventInstance | null> {
  return db.events.findOne({
    order: [['timestamp', 'DESC']],
    where: { session } as any,
  });
}

export function getOrderedEventsAfter(
  db: Database,
  session: number,
  start: number
): Bluebird<EventInstance[] | null> {
  return db.events.findAll({
    order: [['timestamp', 'ASC']],
    where: { session, id: { [Op.gt]: start } },
  });
}

export function getLargestEventID(
  db: Database,
  session: number
): Bluebird<number> {
  return getLastEvent(db, session).then((e: EventInstance | null) => {
    if (e === null) {
      return 0;
    }
    return parseInt(e.get('id') as string, 10);
  });
}

export function commitAndBroadcastAction(
  db: Database,
  session: number,
  client: ClientID,
  instance: string,
  action: ActionEvent
): Bluebird<void> {
  const ev = {
    client: 'SERVER',
    event: action,
    id: null,
    instance: Config.get('NODE_ENV'),
  } as MultiplayerEvent;

  return commitEventWithoutID(db, session, client, instance, 'ACTION', ev).then(
    (eventCount: number | null) => {
      // Broadcast to all peers - note that the event will be set by commitEventWithoutID
      broadcast(session, JSON.stringify(ev));
    }
  );
}

export function commitEventWithoutID(
  db: Database,
  session: number,
  client: string,
  instance: string,
  type: string,
  struct: object
): Bluebird<number | null> {
  // Events by the server may need to be committed without a specific set ID.
  // In these cases, we pass the full object before serialization and fill it
  // with the next available event ID.
  let s: SessionInstance;
  let id: number;
  return db.sequelize
    .transaction((txn: Sequelize.Transaction) => {
      return db.sessions
        .findOne({ where: { id: session }, transaction: txn })
        .then((sessionInstance: SessionInstance) => {
          if (!sessionInstance) {
            throw new Error('could not find session ' + session.toString());
          }
          s = sessionInstance;
          return getLastEvent(db, session);
        })
        .then((eventInstance: EventInstance | null) => {
          if (
            eventInstance !== null &&
            eventInstance.get('client') === client &&
            eventInstance.get('instance') === instance &&
            eventInstance.get('type') === type &&
            eventInstance.get('json') === JSON.stringify(struct)
          ) {
            console.log(
              'Trivial txn: ' +
                type +
                ' already committed for client ' +
                client +
                ' instance ' +
                instance
            );
            id = s.get('eventCounter') as number;
            (struct as any).id = id;
            return false;
          }

          id = (s.get('eventCounter') as number) + 1;
          (struct as any).id = id;
          return s
            .update({ eventCounter: id }, { transaction: txn })
            .then(() => true);
        })
        .then((incremented: boolean) => {
          if (!incremented) {
            // Skip upsert if we didn't increment the event counter
            return false;
          }
          return db.events
            .upsert(
              {
                client,
                id,
                instance,
                json: JSON.stringify(struct),
                session,
                timestamp: new Date(),
                type,
              },
              { transaction: txn, returning: false }
            )
            .then(() => true);
        });
    })
    .then((updated: boolean) => {
      return id;
    });
}

export function commitEvent(
  db: Database,
  session: number,
  client: string,
  instance: string,
  event: number,
  type: string,
  json: string
): Bluebird<number | null> {
  let s: SessionInstance;
  return db.sequelize
    .transaction((txn: Sequelize.Transaction) => {
      return db.sessions
        .findOne({ where: { id: session }, transaction: txn })
        .then((sessionInstance: SessionInstance) => {
          if (!sessionInstance) {
            throw new Error('could not find session ' + session.toString());
          }
          s = sessionInstance;
          return db.events.findOne({ where: { session, id: event } });
        })
        .then((eventInstance: EventInstance | null) => {
          if (
            eventInstance !== null &&
            eventInstance.get('client') === client &&
            eventInstance.get('instance') === instance &&
            eventInstance.get('type') === type &&
            eventInstance.get('json') === json
          ) {
            // The client does retry requests - if we've already successfully
            // committed this event, return success and don't try to commit it again.
            console.log(
              'Trivial txn: ' +
                event +
                ' already committed for client ' +
                client +
                ' instance ' +
                instance
            );
            return false;
          } else if ((s.get('eventCounter') as number) + 1 !== event) {
            throw new Error(
              `event counter increment mismatch (${s.get(
                'eventCounter'
              )} + 1 !== ${event})`
            );
          }

          return s
            .update({ eventCounter: event }, { transaction: txn })
            .then(() => true);
        })
        .then((incremented: boolean) => {
          if (!incremented) {
            // Skip upsert if we didn't increment the event counter
            return false;
          }
          if (event === null) {
            throw new Error('Found null event after it should be set');
          }
          return db.events
            .upsert(
              {
                client,
                id: event,
                instance,
                json,
                session,
                timestamp: new Date(),
                type,
              },
              { transaction: txn, returning: false }
            )
            .then(() => true);
        });
    })
    .then((updated: boolean) => {
      return updated ? event : null;
    });
}

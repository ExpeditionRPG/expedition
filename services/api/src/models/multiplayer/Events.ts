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
  session: number,
): Promise<EventInstance | null> {
  return db.events.findOne({
    order: [['timestamp', 'DESC']],
    where: { session },
  });
}

export function getOrderedEventsAfter(
  db: Database,
  session: number,
  start: number,
): Promise<EventInstance[]> {
  return db.events.findAll({
    order: [['id', 'ASC']],
    where: { session, id: { [Op.gt]: start } },
  });
}

export function getLargestEventID(
  db: Database,
  session: number,
): Promise<number> {
  return db.events
    .findOne({ order: [['id', 'DESC']], where: { session } })
    .then((e: EventInstance | null) => {
      if (e === null) {
        return 0;
      }
      // `id` is a BIGINT column and node-postgres hands int8 back as a *string*,
      // so the declared `number` type is a lie at runtime in production (the
      // sqlite-backed tests do return a number, which is why nothing catches it
      // here). Callers do arithmetic on this -- Chaos.ts does `latestID + 1` --
      // so the coercion the original `parseInt(e.get('id'), 10)` performed has
      // to stay. `Number()` accepts both shapes; `parseInt` no longer typechecks
      // now that `get('id')` is typed.
      return Number(e.get('id'));
    });
}

export function commitAndBroadcastAction(
  db: Database,
  session: number,
  client: ClientID,
  instance: string,
  action: ActionEvent,
): Promise<void> {
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
    },
  );
}

export function commitEventWithoutID(
  db: Database,
  session: number,
  client: string,
  instance: string,
  type: string,
  struct: object,
): Promise<number | null> {
  // Events by the server may need to be committed without a specific set ID.
  // In these cases, we pass the full object before serialization and fill it
  // with the next available event ID.
  let s: SessionInstance;
  let id: number;
  return db.sequelize
    .transaction((txn: Sequelize.Transaction) => {
      return db.sessions
        .findOne({
          where: { id: session },
          transaction: txn,
          lock: Sequelize.Transaction.LOCK.UPDATE,
        })
        .then((sessionInstance: SessionInstance | null) => {
          if (!sessionInstance) {
            throw new Error('could not find session ' + session.toString());
          }
          s = sessionInstance;
          // A successful attempt writes its assigned id back into struct.
          // Retry that exact event, even if another action has committed since.
          const assignedID = (struct as { id?: number | null }).id;
          return db.events.findOne({
            where:
              typeof assignedID === 'number' &&
              Number.isSafeInteger(assignedID) &&
              assignedID > 0
                ? { session, id: assignedID }
                : { session },
            order: [['id', 'DESC']],
            transaction: txn,
          });
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
                instance,
            );
            id = Number(eventInstance.get('id'));
            (struct as any).id = id;
            return false;
          }

          id = s.get('eventCounter') + 1;
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
              { transaction: txn, returning: false },
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
  json: string,
): Promise<number | null> {
  let s: SessionInstance;
  return db.sequelize
    .transaction((txn: Sequelize.Transaction) => {
      return db.sessions
        .findOne({
          where: { id: session },
          transaction: txn,
          lock: Sequelize.Transaction.LOCK.UPDATE,
        })
        .then((sessionInstance: SessionInstance | null) => {
          if (!sessionInstance) {
            throw new Error('could not find session ' + session.toString());
          }
          s = sessionInstance;
          return db.events.findOne({
            where: { session, id: event },
            transaction: txn,
          });
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
                instance,
            );
            return false;
          } else if (s.get('eventCounter') + 1 !== event) {
            throw new Error(
              `event counter increment mismatch (${s.get(
                'eventCounter',
              )} + 1 !== ${event})`,
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
              { transaction: txn, returning: false },
            )
            .then(() => true);
        });
    })
    .then((updated: boolean) => {
      return updated ? event : null;
    });
}

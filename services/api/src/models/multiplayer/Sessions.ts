import Bluebird from 'bluebird';
import Sequelize from 'sequelize';
import { makeSecret } from 'shared/multiplayer/Session';
import { Session } from 'shared/schema/multiplayer/Sessions';
import { Database, EventInstance, SessionInstance } from '../Database';

const { Op } = Sequelize;

export function getSessionBySecret(
  db: Database,
  secret: string
): Bluebird<SessionInstance> {
  return db.sessions
    .findOne({ where: { secret, locked: false } })
    .then((result: SessionInstance) => {
      return result || null;
    });
}

export function createSession(db: Database): Bluebird<SessionInstance> {
  return db.sessions.create(
    new Session({
      eventCounter: 0,
      id: Date.now(),
      locked: false,
      secret: makeSecret(),
    })
  );
}

export function getSessionQuestTitle(
  db: Database,
  session: number
): Bluebird<string | null> {
  return db.events
    .findOne({
      attributes: ['json'],
      order: [['created_at', 'DESC']],
      where: { session, json: { [Op.like]: '%fetchQuestXML%' } } as any,
    })
    .then((e: EventInstance) => {
      if (e === null) {
        return null;
      }

      try {
        const event = JSON.parse(e.get('json') as any).event as any;
        const args = JSON.parse(event.args);
        return args.title || null;
      } catch (e) {
        return null;
      }
    });
}

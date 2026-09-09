import Sequelize from 'sequelize';
import { makeSecret } from 'shared/multiplayer/Session';
import { Session } from 'shared/schema/multiplayer/Sessions';
import { Database, EventInstance, SessionInstance } from '../Database';

const { Op } = Sequelize;

export function getSessionBySecret(
  db: Database,
  secret: string,
): Promise<SessionInstance | null> {
  return db.sessions
    .findOne({ where: { secret, locked: false } })
    .then((result: SessionInstance | null) => {
      return result || null;
    });
}

export function createSession(db: Database): Promise<SessionInstance> {
  return db.sessions.create(
    new Session({
      eventCounter: 0,
      id: Date.now(),
      locked: false,
      secret: makeSecret(),
    }),
  );
}

export function getSessionQuestTitle(
  db: Database,
  session: number,
): Promise<string | null> {
  return db.events
    .findOne({
      attributes: ['json'],
      order: [['created_at', 'DESC']],
      where: { session, json: { [Op.like]: '%fetchQuestXML%' } },
    })
    .then((e: EventInstance | null) => {
      if (e === null) {
        return null;
      }

      try {
        const event = JSON.parse(e.get('json')).event;
        const args = JSON.parse(event.args);
        return args.title || null;
      } catch (err) {
        return null;
      }
    });
}

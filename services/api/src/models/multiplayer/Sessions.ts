import Bluebird from 'bluebird';
import {makeSecret} from 'shared/multiplayer/Session';
import {Session} from 'shared/schema/multiplayer/Sessions';
import {Database, EventInstance, SessionInstance} from '../Database';

export function getSessionBySecret(db: Database, secret: string): Bluebird<SessionInstance> {
  return db.sessions.findOne({where: {secret, locked: false}})
    .then((result: SessionInstance) => {
      return result || null;
    });
}

export function createSession(db: Database): Bluebird<SessionInstance> {
  return db.sessions.create(new Session({
    id: Date.now(),
    secret: makeSecret(),
    eventCounter: 0,
    locked: false,
  }));
}

export function getSessionQuestTitle(db: Database, session: number): Bluebird<string|null> {
  return db.events.findOne({
    attributes: ['json'],
    where: {session, json: {$like: '%fetchQuestXML%'}} as any,
    order: [['created_at', 'DESC']],
  })
  .then((e: EventInstance) => {
    if (e === null) {
      return null;
    }

    try {
      const event = JSON.parse(e.get('json')).event;
      const args = JSON.parse(event.args);
      return args.title || null;
    } catch (e) {
      return null;
    }
  });
}

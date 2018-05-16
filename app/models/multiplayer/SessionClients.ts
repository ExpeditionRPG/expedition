import Bluebird from 'bluebird'
import {Database, SessionClientInstance} from '../Database'

export function verifySessionClient(db: Database, session: number, client: string, secret: string): Bluebird<boolean> {
  return db.sessionClients.findOne({where: {session, client, secret}})
    .then((result: SessionClientInstance) => {
      if (!result) {
        return false;
      }
      return true;
    });
}

export function getClientSessions(db: Database, client: string): Bluebird<SessionClientInstance[]> {
  return db.sessionClients.findAll({
      where: {client},
      order: [['updated_at', 'DESC']],
      limit: 5,
    });
}

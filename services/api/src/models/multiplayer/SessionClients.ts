import { Database, SessionClientInstance } from '../Database';

export function verifySessionClient(
  db: Database,
  session: number,
  client: string,
  secret: string,
): Promise<boolean> {
  return db.sessionClients
    .findOne({ where: { session, client, secret } })
    .then((result: SessionClientInstance | null) => {
      if (!result) {
        return false;
      }
      return true;
    });
}

export function getClientSessions(
  db: Database,
  client: string,
): Promise<SessionClientInstance[]> {
  return db.sessionClients.findAll({
    limit: 5,
    order: [['updated_at', 'DESC']],
    where: { client },
  });
}

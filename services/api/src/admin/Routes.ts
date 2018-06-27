import * as express from 'express';
import Config from '../config';
import {limitCors} from '../lib/cors';
import {Database} from '../models/Database';
import * as Handlers from './Handlers';

// We store auth details in res.locals. If there's no stored data there, the user is not logged in.
function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!res.locals || !res.locals.id) {
    return res.status(500).end('You are not signed in.');
  }
  let superUsers: string[] = [];
  try {
    superUsers = JSON.parse(Config.get('SUPER_USER_IDS'));
  } catch (e) {
    console.error('Failed to parse SUPER_USER_IDS');
    return res.status(401).end('You are not authorized.');
  }
  for (const id of superUsers) {
    if (res.locals.id === id) {
      return next();
    }
  }
  return res.status(401).end('You are not authorized.');
}

export function installRoutes(db: Database, router: express.Router) {
  router.post('/admin/feedback/query', requireAdminAuth, limitCors, (req, res) => Handlers.queryFeedback(db, req, res));
  router.post('/admin/feedback/modify', requireAdminAuth, limitCors, (req, res) => Handlers.modifyFeedback(db, req, res));
  router.post('/admin/quest/query', requireAdminAuth, limitCors, (req, res) => Handlers.queryQuest(db, req, res));
  router.post('/admin/quest/modify', requireAdminAuth, limitCors, (req, res) => Handlers.modifyQuest(db, req, res));
  router.post('/admin/user/query', requireAdminAuth, limitCors, (req, res) => Handlers.queryUser(db, req, res));
  router.post('/admin/user/modify', requireAdminAuth, limitCors, (req, res) => Handlers.modifyUser(db, req, res));
}

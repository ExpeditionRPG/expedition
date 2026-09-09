import * as express from 'express';
import Config from '../config';
import { limitCors } from '../lib/cors';
import { Database } from '../models/Database';
import * as Handlers from './Handlers';

// We store auth details in res.locals. If there's no stored data there, the user is not logged in.
function requireAdminAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  if (!res.locals || !res.locals.id) {
    return res.status(401).end('You are not signed in.');
  }
  let superUsers: string[];
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
  // `limitCors` must come BEFORE `requireAdminAuth` on every route, exactly as
  // it does in services/api/src/Routes.ts. requireAdminAuth answers 401 itself
  // and never calls next(), so mounting it first meant the CORS middleware
  // never ran and the 401 went out with no Access-Control-Allow-Origin header.
  // A browser then rejects the response before the app can see the status,
  // reporting net::ERR_FAILED instead of a readable 401.
  router.post(
    '/admin/feedback/query',
    limitCors,
    requireAdminAuth,
    (req, res) => Handlers.queryFeedback(db, req, res),
  );
  router.post(
    '/admin/feedback/modify',
    limitCors,
    requireAdminAuth,
    (req, res) => Handlers.modifyFeedback(db, req, res),
  );
  router.post('/admin/quest/query', limitCors, requireAdminAuth, (req, res) =>
    Handlers.queryQuest(db, req, res),
  );
  router.post('/admin/quest/modify', limitCors, requireAdminAuth, (req, res) =>
    Handlers.modifyQuest(db, req, res),
  );
  router.post('/admin/user/query', limitCors, requireAdminAuth, (req, res) =>
    Handlers.queryUser(db, req, res),
  );
  router.post('/admin/user/modify', limitCors, requireAdminAuth, (req, res) =>
    Handlers.modifyUser(db, req, res),
  );
  router.get('/admin/ratings/recalc', limitCors, (req, res) =>
    Handlers.recalculateRatings(db, req, res),
  );
}

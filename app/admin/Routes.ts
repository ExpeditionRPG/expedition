import * as express from 'express'
import * as Handlers from './Handlers'
import Config from '../config'
import {models} from '../models/Database'
import {limitCors} from '../lib/cors'

// We store auth details in res.locals. If there's no stored data there, the user is not logged in.
function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!res.locals || !res.locals.id) {
    return res.status(500).end('You are not signed in.');
  }
  for (const id of Config.get('SUPER_USER_IDS')) {
    if (res.locals.id === id) {
      return next();
    }
  }
  return res.status(401).end('You are not authorized.');
}

export function installRoutes(router: express.Router) {
  router.post('/admin/feedback/query', requireAdminAuth, limitCors, (req, res) => {Handlers.queryFeedback(models.Feedback, models.Quest, models.User, req, res);});
  router.post('/admin/feedback/modify', requireAdminAuth, limitCors, (req, res) => {Handlers.modifyFeedback(models.Feedback, req, res);});
  router.post('/admin/quest/query', requireAdminAuth, limitCors, (req, res) => {Handlers.queryQuest(models.Quest, req, res);});
  router.post('/admin/quest/modify', requireAdminAuth, limitCors, (req, res) => {Handlers.modifyQuest(models.Quest, req, res);});
  router.post('/admin/user/query', requireAdminAuth, limitCors, (req, res) => {Handlers.queryUser(models.User, req, res);});
  router.post('/admin/user/modify', requireAdminAuth, limitCors, (req, res) => {Handlers.modifyUser(models.User, req, res);});
}

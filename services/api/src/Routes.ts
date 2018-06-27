import * as express from 'express';
import {installRoutes as installAdminRoutes} from './admin/Routes';
import Config from './config';
import * as Handlers from './Handlers';
import {limitCors} from './lib/cors';
import {installOAuthRoutes, oauth2Template} from './lib/oauth2';
import * as Mail from './Mail';
import {Database} from './models/Database';
import * as MultiplayerHandlers from './multiplayer/Handlers';
import * as Stripe from './Stripe';

const RateLimit = require('express-rate-limit');

const Mailchimp = require('mailchimp-api-v3');
const mailchimp = (Config.get('NODE_ENV') !== 'dev' && Config.get('MAILCHIMP_KEY')) ? new Mailchimp(Config.get('MAILCHIMP_KEY')) : null;

export function installRoutes(db: Database, router: express.Router) {
  // Use the oauth middleware to automatically get the user's profile
  // information and expose login/logout URLs to templates.
  router.use(oauth2Template);

  const publishLimiter = new RateLimit({
    delayAfter: 2, // begin slowing down responses after the second request
    delayMs: 3 * 1000, // slow down subsequent responses by 3 seconds per request
    max: 5, // start blocking after 5 requests
    message: 'Publishing too frequently. Please wait 1 minute and then try again',
    windowMs: 60 * 1000, // 1 minute window
  });

  const sessionLimiter = new RateLimit({
    delayAfter: 4,     // begin slowing down responses after the fourth request
    delayMs: 3 * 1000,   // slow down subsequent responses by 3 seconds per request
    max: 5,            // start blocking after 5 requests
    message: 'Creating sessions too frequently. Please wait 1 minute and then try again',
    windowMs: 60 * 1000, // 1 minute window
  });

  // We store auth details in res.locals. If there's no stored data there, the user is not logged in.
  function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!res.locals || !res.locals.id) {
      return res.status(500).end('You are not signed in.');
    }
    next();
  }

  router.get('/healthcheck', limitCors, Handlers.healthCheck);
  router.get('/announcements', limitCors, Handlers.announcement);
  router.post('/analytics/:category/:action', limitCors, (req, res) => {Handlers.postAnalyticsEvent(db, req, res); });
  router.post('/quests', limitCors, (req, res) => {Handlers.search(db, req, res); });
  router.get('/raw/:partition/:quest/:version', limitCors, (req, res) => {Handlers.questXMLHandler(db, req, res); });
  router.post('/publish/:id', publishLimiter, limitCors, requireAuth, (req, res) => {Handlers.publish(db, Mail, req, res); });
  router.post('/unpublish/:quest', limitCors, requireAuth, (req, res) => {Handlers.unpublish(db, req, res); });
  router.post('/quest/feedback/:type', limitCors, (req, res) => {Handlers.feedback(db, Mail, req, res); });
  router.post('/user/subscribe', limitCors, (req, res) => {Handlers.subscribe(mailchimp, Config.get('MAILCHIMP_PLAYERS_LIST_ID'), req, res); });
  router.get('/user/quests', limitCors, requireAuth, (req, res) => {Handlers.userQuests(db, req, res); });
  router.get('/multiplayer/v1/user', limitCors, requireAuth, (req, res) => {MultiplayerHandlers.user(db, req, res); });
  router.post('/multiplayer/v1/new_session', sessionLimiter, limitCors, requireAuth, (req, res) => {MultiplayerHandlers.newSession(db, req, res); });
  router.post('/multiplayer/v1/connect', limitCors, requireAuth, (req, res) => {MultiplayerHandlers.connect(db, req, res); });
  router.post('/stripe/checkout', limitCors, (req, res) => {Stripe.checkout(req, res); });

  installAdminRoutes(db, router);
  installOAuthRoutes(db, router);
}

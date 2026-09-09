import * as express from 'express';
import { rateLimit } from 'express-rate-limit';
import { slowDown } from 'express-slow-down';
import { installRoutes as installAdminRoutes } from './admin/Routes';
import Config from './config';
import * as Handlers from './Handlers';
import { limitCors } from './lib/cors';
import { installOAuthRoutes, oauth2Template } from './lib/oauth2';
import * as Mail from './Mail';
import { Database } from './models/Database';
import * as MultiplayerHandlers from './multiplayer/Handlers';
import * as Stripe from './Stripe';

const Mailchimp = require('mailchimp-api-v3');
const mailchimp =
  Config.get('NODE_ENV') !== 'dev' && Config.get('MAILCHIMP_KEY')
    ? new Mailchimp(Config.get('MAILCHIMP_KEY'))
    : null;

export function installRoutes(db: Database, router: express.Router) {
  // Use the oauth middleware to automatically get the user's profile
  // information and expose login/logout URLs to templates.
  router.use(oauth2Template);

  // express-rate-limit 2 both delayed and blocked. v6 dropped `delayAfter` /
  // `delayMs` and moved that half to express-slow-down, so each of these is now
  // a pair of middlewares. Mounted limiter-first, they reproduce v2 exactly:
  // v2 incremented once, answered 429 immediately when the count passed `max`
  // (never delaying a blocked request), and otherwise slept
  // `(count - delayAfter) * delayMs` before calling next().
  const SLOW_DOWN_STEP_MS = 3 * 1000;
  const RATE_LIMIT_WINDOW_MS = 60 * 1000;

  const publishLimiter = rateLimit({
    limit: 5, // start blocking after 5 requests (v2 spelled this `max`)
    message:
      'Publishing too frequently. Please wait 1 minute and then try again',
    windowMs: RATE_LIMIT_WINDOW_MS, // 1 minute window
  });
  const publishSlowdown = slowDown({
    delayAfter: 2, // begin slowing down responses after the second request
    // slow down subsequent responses by 3 seconds per request. Passing a bare
    // number means "a flat 3s for every request past the second" in
    // express-slow-down 2+; the old cumulative behaviour is this function.
    delayMs: used => (used - 2) * SLOW_DOWN_STEP_MS,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });

  const sessionLimiter = rateLimit({
    limit: 5, // start blocking after 5 requests
    message:
      'Creating sessions too frequently. Please wait 1 minute and then try again',
    windowMs: RATE_LIMIT_WINDOW_MS, // 1 minute window
  });
  const sessionSlowdown = slowDown({
    delayAfter: 4, // begin slowing down responses after the fourth request
    delayMs: used => (used - 4) * SLOW_DOWN_STEP_MS,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });

  // We store auth details in res.locals. If there's no stored data there, the user is not logged in.
  function requireAuth(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) {
    if (!res.locals || !res.locals.id) {
      // 401, not 500: this is the client's problem, not the server's, and it
      // matches requireAdminAuth and lib/oauth2's requireAuth.
      return res.status(401).end('You are not signed in.');
    }
    next();
  }

  function betaACAO(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) {
    if (
      Config.get('API_URL_BASE').indexOf('beta') !== -1 &&
      res.header &&
      req.get('origin')
    ) {
      res.header('Access-Control-Allow-Origin', req.get('origin'));
    }
    next();
  }

  router.options('/*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.get('origin'));
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Content-Length, X-Requested-With',
    );
    res.sendStatus(200);
  });

  router.get('/healthcheck', limitCors, betaACAO, Handlers.healthCheck);
  router.get('/announcements', limitCors, betaACAO, Handlers.announcement);
  router.get('/qc/announcements', limitCors, betaACAO, Handlers.qcAnnouncement);
  router.post(
    '/analytics/:category/:action',
    limitCors,
    betaACAO,
    (req, res) => {
      Handlers.postAnalyticsEvent(db, req, res);
    },
  );
  router.post('/quests', limitCors, betaACAO, (req, res) => {
    Handlers.search(db, req, res);
  });
  router.post('/save/quest/:id', limitCors, betaACAO, (req, res) => {
    Handlers.saveQuestData(db, req, res);
  });
  router.get('/qdl/:quest/:edittime', limitCors, betaACAO, (req, res) => {
    Handlers.loadQuestData(db, req, res);
  });
  router.get(
    '/raw/:partition/:quest/:version',
    limitCors,
    betaACAO,
    (req, res) => {
      Handlers.questXMLHandler(db, req, res);
    },
  );
  router.post(
    '/publish/:id',
    publishLimiter,
    publishSlowdown,
    limitCors,
    betaACAO,
    requireAuth,
    (req, res) => {
      Handlers.publish(db, Mail, req, res);
    },
  );
  router.post(
    '/unpublish/:quest',
    limitCors,
    betaACAO,
    requireAuth,
    (req, res) => {
      Handlers.unpublish(db, req, res);
    },
  );
  router.post('/quest/feedback/:type', limitCors, betaACAO, (req, res) => {
    // feedback() answers the request itself and logs the failure, then rejects
    // so its unit tests can assert that it failed. Sequelize 5 handed back
    // bluebird promises, where an unhandled rejection is only a printed
    // warning; sequelize 6 returns native ones, and Node >= 15 terminates the
    // process on an unhandled rejection. Without this catch, an unparseable
    // body, an unknown feedback type, or feedback filed against a quest that
    // no longer exists takes the whole API server down. Nothing is swallowed
    // here that the handler has not already reported.
    Handlers.feedback(db, Mail, req, res).catch(() => undefined);
  });
  router.post('/user/subscribe', limitCors, betaACAO, (req, res) => {
    Handlers.subscribe(
      mailchimp,
      Config.get('MAILCHIMP_PLAYERS_LIST_ID'),
      req,
      res,
    );
  });
  router.get('/user/quests', limitCors, betaACAO, requireAuth, (req, res) => {
    Handlers.userQuests(db, req, res);
  });
  router.get(
    '/user/feedbacks',
    limitCors,
    betaACAO,
    requireAuth,
    (req, res) => {
      Handlers.userFeedbacks(db, req, res);
    },
  );
  router.get('/user/badges', limitCors, betaACAO, requireAuth, (req, res) => {
    Handlers.userBadges(db, req, res);
  });
  router.get(
    '/multiplayer/v1/user',
    limitCors,
    betaACAO,
    requireAuth,
    (req, res) => {
      MultiplayerHandlers.user(db, req, res);
    },
  );
  router.post(
    '/multiplayer/v1/new_session',
    sessionLimiter,
    sessionSlowdown,
    limitCors,
    betaACAO,
    requireAuth,
    (req, res) => {
      MultiplayerHandlers.newSession(db, req, res);
    },
  );
  router.post(
    '/multiplayer/v1/connect',
    limitCors,
    betaACAO,
    requireAuth,
    (req, res) => {
      MultiplayerHandlers.connect(db, req, res);
    },
  );
  router.post('/stripe/checkout', limitCors, betaACAO, (req, res) => {
    Stripe.checkout(req, res);
  });

  installAdminRoutes(db, router);
  installOAuthRoutes(db, router);
}

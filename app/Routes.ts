import * as express from 'express'
import Config from './config'
import * as Mail from './Mail'
import * as oauth2 from './lib/oauth2'
import * as Handlers from './Handlers'
import * as MultiplayerHandlers from './multiplayer/Handlers'
import * as Stripe from './Stripe'
import {models} from './models/Database'
import * as WebSocket from 'ws';
import * as http from 'http';
import {installRoutes as installAdminRoutes} from './admin/Routes'
import {limitCors} from './lib/cors'

const apicache = require('apicache');
const querystring = require('querystring');
const RateLimit = require('express-rate-limit');
apicache.options({
  headerBlacklist: ['Access-Control-Allow-Origin'],
});
const cache = apicache.middleware;

const Mailchimp = require('mailchimp-api-v3');
const mailchimp = (Config.get('NODE_ENV') !== 'dev' && Config.get('MAILCHIMP_KEY')) ? new Mailchimp(Config.get('MAILCHIMP_KEY')) : null;

// Use the oauth middleware to automatically get the user's profile
// information and expose login/logout URLs to templates.
const Router = express.Router();
Router.use(oauth2.template);

const publishLimiter = new RateLimit({
  windowMs: 60*1000, // 1 minute window
  delayAfter: 2, // begin slowing down responses after the second request
  delayMs: 3*1000, // slow down subsequent responses by 3 seconds per request
  max: 5, // start blocking after 5 requests
  message: 'Publishing too frequently. Please wait 1 minute and then try again',
});

// TODO: Rate-limit session creation
const sessionLimiter = new RateLimit({
  windowMs: 60*1000, // 1 minute window
  delayAfter: 4,     // begin slowing down responses after the fourth request
  delayMs: 3*1000,   // slow down subsequent responses by 3 seconds per request
  max: 5,            // start blocking after 5 requests
  message: 'Creating sessions too frequently. Please wait 1 minute and then try again',
});

// We store auth details in res.locals. If there's no stored data there, the user is not logged in.
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!res.locals || !res.locals.id) {
    return res.status(500).end('You are not signed in.');
  }
  next();
}

Router.get('/healthcheck', limitCors, Handlers.healthCheck);
Router.get('/announcements', cache('24 hours'), limitCors, Handlers.announcement);
Router.post('/analytics/:category/:action', limitCors, (req, res) => {Handlers.postAnalyticsEvent(models.AnalyticsEvent, req, res);});
Router.post('/quests', limitCors, (req, res) => {Handlers.search(models.Quest, req, res);});
Router.get('/raw/:partition/:quest/:version', limitCors, (req, res) => {Handlers.questXMLHandler(models.Quest, models.RenderedQuest, req, res);});
Router.post('/publish/:id', publishLimiter, limitCors, requireAuth, (req, res) => {Handlers.publish(models.Quest, req, res);});
Router.post('/unpublish/:quest', limitCors, requireAuth, (req, res) => {Handlers.unpublish(models.Quest, req, res);});
Router.post('/quest/feedback/:type', limitCors, (req, res) => {Handlers.feedback(models.Feedback, req, res);});
Router.post('/user/subscribe', limitCors, (req, res) => {Handlers.subscribe(mailchimp, Config.get('MAILCHIMP_PLAYERS_LIST_ID'), req, res);});
Router.get('/multiplayer/v1/user', limitCors, requireAuth, (req, res) => {MultiplayerHandlers.user(models.SessionClient, models.Event, req, res);});
Router.post('/multiplayer/v1/new_session', sessionLimiter, limitCors, requireAuth, (req, res) => {MultiplayerHandlers.newSession(models.Session, req, res);});
Router.post('/multiplayer/v1/connect', limitCors, requireAuth, (req, res) => {MultiplayerHandlers.connect(models.Session, models.SessionClient, req, res);});
Router.post('/stripe/checkout', limitCors, (req, res) => {Stripe.checkout(req, res);});

installAdminRoutes(Router);

export function setupWebsockets(server: any) {
  const wss = new WebSocket.Server({
    server,
    verifyClient: (info: any, cb: (verified: boolean)=>any) => {
      MultiplayerHandlers.verifyWebsocket(models.SessionClient, info, cb);
    }
  });

  wss.on('error', (err) => {
    console.error('Caught WSS error: ');
    console.error(err.stack);
  });

  wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
    ws.on('error', (e: Error) => console.error(e));
    MultiplayerHandlers.websocketSession(models.Session, models.SessionClient, ws, req);
  });
}

export default Router;

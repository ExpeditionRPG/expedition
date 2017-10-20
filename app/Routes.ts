import * as express from 'express'
import Config from './config'
import * as Mail from './Mail'
import * as oauth2 from './lib/oauth2'
import * as Handlers from './Handlers'
import {models} from './models/Database'

const Cors = require('cors');

const querystring = require('querystring');
const RateLimit = require('express-rate-limit');

const Mailchimp = require('mailchimp-api-v3');
const mailchimp = (Config.get('NODE_ENV') !== 'dev' && Config.get('MAILCHIMP_KEY')) ? new Mailchimp(Config.get('MAILCHIMP_KEY')) : null;

// Use the oauth middleware to automatically get the user's profile
// information and expose login/logout URLs to templates.
const Router = express.Router();
Router.use(oauth2.template);

const limitCors = Cors({
  credentials: true,
  // Allow:
  // - expedition domains (for web apps)
  // - file (for mobile apps)
  // - localhost (for local dev)
  // - *.local (for dev on mobile)
  origin: /(expedition(game|rpg)\.com$)|(^file:\/\/)|(localhost(:[0-9]+)?$)|(.*\.local$)/i,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
});

const publishLimiter = new RateLimit({
  windowMs: 60*1000, // 1 minute window
  delayAfter: 2, // begin slowing down responses after the second request
  delayMs: 3*1000, // slow down subsequent responses by 3 seconds per request
  max: 5, // start blocking after 5 requests
  message: 'Publishing too frequently. Please wait 1 minute and then try again',
});

Router.get('/healthcheck', limitCors, Handlers.healthCheck);
Router.get('/announcements', limitCors, Handlers.announcement);
Router.post('/quests', limitCors, (req, res) => {Handlers.search(models.Quest, req, res);});
Router.get('/raw/:quest', limitCors, (req, res) => {Handlers.questXMLRedirect(models.Quest, req, res);});
Router.post('/publish/:id', publishLimiter, limitCors, (req, res) => {Handlers.publish(models.Quest, req, res);});
Router.post('/unpublish/:quest', limitCors, (req, res) => {Handlers.unpublish(models.Quest, req, res);});
Router.post('/quest/feedback/:type', limitCors, (req, res) => {Handlers.feedback(models.Feedback, req, res);});
Router.post('/user/subscribe', limitCors, (req, res) => {Handlers.subscribe(mailchimp, Config.get('MAILCHIMP_PLAYERS_LIST_ID'), req, res);});

export default Router;

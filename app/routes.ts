import * as express from 'express'
import passport from 'passport'
import Config from './config'
import * as Mail from './mail'
import * as oauth2 from './lib/oauth2'
import {QuestInstance} from './models/Quests'
import {models} from './models/database'

const Joi = require('joi');
const Cors = require('cors');
const fs = require('fs');
const Mailchimp = require('mailchimp-api-v3');
const querystring = require('querystring');
const RateLimit = require('express-rate-limit');

const mailchimp = (Config.get('NODE_ENV') !== 'dev' && Config.get('MAILCHIMP_KEY')) ? new Mailchimp(Config.get('MAILCHIMP_KEY')) : null;

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please contact support by emailing Expedition@Fabricate.io';

// Use this partition for any operations on public-facing quests.
const PUBLIC_PARTITION = 'expedition-public';

// Use the oauth middleware to automatically get the user's profile
// information and expose login/logout URLs to templates.
const router = express.Router();
router.use(oauth2.template);

const limitCors = Cors({
  credentials: true,
  // allows expedition domains, localhost and file (for dev + mobile apps)
  origin: /(expedition(game|rpg)\.com$)|(localhost(:[0-9]+)?$)|(^file:\/\/)/i,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
});

const publishLimiter = new RateLimit({
  windowMs: 60*1000, // 1 minute window
  delayAfter: 2, // begin slowing down responses after the second request
  delayMs: 3*1000, // slow down subsequent responses by 3 seconds per request
  max: 5, // start blocking after 5 requests
  message: 'Publishing too frequently. Please wait 1 minute and then try again',
});

router.get('/healthcheck', limitCors, (req: express.Request, res: express.Response) => {
  res.send(' ');
});

router.get('/announcements', limitCors, (req: express.Request, res: express.Response) => {
  // empty / no announcement: {message: '', link: ''}
  // res.json({
  //   message: '',
  //   link: '',
  // });
  res.json({
    message: 'The first expansion is now on Kickstarter! Click here to check it out',
    link: 'https://ExpeditionGame.com/kickstarter',
  });
});

// Phasing out as of 3/21/17; delete any time after 4/14/17
// Joi validation: require title, author, email (valid email), feedback, players, difficulty
// userEmail (valid email), platform, shareUserEmail (default false), version (number)
router.post('/feedback', limitCors, (req: express.Request, res: express.Response) => {
  const params = JSON.parse(req.body);
  // strip all HTML tags for protection, then replace newlines with br's
  const HTML_REGEX = /<(\w|(\/\w))(.|\n)*?>/igm;
  const title = params.title.replace(HTML_REGEX, '');
  const htmlFeedback = params.feedback.replace(HTML_REGEX, '').replace(/(?:\r\n|\r|\n)/g, '<br/>');
  let shareUserEmail = '';
  if (params.shareUserEmail && params.userEmail) {
    shareUserEmail = `<p>If you'd like to contact them about their feedback, you can reach them at <a href="mailto:${params.userEmail}">${params.userEmail}</a>.</p>`
  }

  const htmlMessage = `<p>${params.author}, some adventurers sent you feedback on <i>${title}</i>. Hooray! Their feedback:</p>
  <p>"${htmlFeedback}"</p>
  <p>They played with ${params.players} adventurers on ${params.difficulty} difficulty on ${params.platform} v${params.version}.</p>
  ${shareUserEmail}
  <p>If you have questions or run into bugs with the Quest Creator, you can reply directly to this email.</p>
  <p>Happy Adventuring!</p>
  <p>Todd & Scott</p>`;

  res.header('Access-Control-Allow-Origin', req.get('origin'));
  Mail.send(params.email, 'Feedback on your Expedition quest: ' + title, htmlMessage)
    .then((result: any) => {
      res.send(result.response);
    })
    .catch((e: Error) => {
      console.log(e);
      res.status(500).send(GENERIC_ERROR_MESSAGE);
    });
  });
});

router.post('/quests', limitCors, (req: express.Request, res: express.Response) => {
  if (!res.locals || !res.locals.id) {
    return res.send(JSON.stringify([]));
  }
  const params = req.body;
  models.Quest.search(PUBLIC_PARTITION, res.locals.id, params)
    .then((quests: QuestInstance[]) => {
      const result = {error: null, quests, hasMore};
      console.log('Found ' + quests.length + ' quests for user ' + res.locals.id);
      res.send(JSON.stringify(result));
    })
    .catch((e: Error) => {
      console.log(e);
      return res.status(500).send(GENERIC_ERROR_MESSAGE);
    });
});

router.get('/raw/:quest', limitCors, (req: express.Request, res: express.Response) => {
  models.Quest.get(PUBLIC_PARTITION, req.params.quest)
    .then((quest: QuestInstance) => {
      res.header('Content-Type', 'text/xml');
      res.header('Location', quest.dataValues.url);
      res.status(301).end();
    })
    .catch((e: Error) => {
      console.log(e);
      return res.status(500).send(GENERIC_ERROR_MESSAGE);
    });
});

router.post('/publish/:id', publishLimiter, limitCors, (req: express.Request, res: express.Response) => {
  if (!res.locals.id) {
    return res.status(500).end('You are not signed in. Please sign in (by refreshing the page) to save your quest.');
  }

  // TODO: Construct quest attributes
  //  req.params.id, req.query

  models.Quest.publish(PUBLIC_PARTITION, res.locals.id, {}, req.body)
    .then((id: string) => {
      console.log('Published quest ' + id);
      res.end(id);
    })
    .catch((e: Error) => {
      console.log(e);
      return res.status(500).send(GENERIC_ERROR_MESSAGE);
    })
});

router.post('/unpublish/:quest', limitCors, (req: express.Request, res: express.Response) => {
  if (!res.locals.id) {
    return res.status(500).end('You are not signed in. Please sign in (by refreshing the page) to save your quest.');
  }

  models.Quest.unpublish(PUBLIC_PARTITION, req.params.quest)
    .then(() => {
      res.end('ok');
    })
    .catch((e: Error) => {
      console.log(e);
      return res.status(500).send(GENERIC_ERROR_MESSAGE);
    });
});

router.post('/quest/feedback/:type', limitCors, (req: express.Request, res: express.Response) => {
  models.Feedback.submit(req.params.type, req.body)
    .then((id: string) => {
      res.end('ok');
    }).catch((e: Error) => {
      console.log(e);
      return res.status(500).send(GENERIC_ERROR_MESSAGE);
    });
});

router.post('/user/subscribe', limitCors, (req: express.Request, res: express.Response) => {
  req.body = JSON.parse(req.body);
  Joi.validate(req.body.email, Joi.string().email().invalid(''), (err: Error, email: string) => {

    if (err) {
      return res.status(400).send('Valid email address required.');
    }

    // TODO: Move this logic into the mail.ts file.
    if (!mailchimp) {
      return res.status(200).send();
    } else {
      mailchimp.post('/lists/' + Config.get('MAILCHIMP_PLAYERS_LIST_ID') + '/members/', {
        email_address: email,
        status: 'pending',
        merge_fields: {
          SOURCE: 'app',
        },
      }, (result: any, err: Error) => {
        if (err) {
          const status = (err as any).status;
          if (status === 400) {
            return res.status(200).send(); // Already on the list - but that's ok!
          } else {
            console.log('Mailchimp error', err);
            return res.status(status).send((err as any).title);
          }
        }
        console.log(email + ' subscribed as pending to player list');
        return res.status(200).send();
      });
    }
  });
});

export default router;

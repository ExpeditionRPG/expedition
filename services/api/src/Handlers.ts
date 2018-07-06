import * as Bluebird from 'bluebird';
import * as cheerio from 'cheerio';
import * as express from 'express';
import * as Joi from 'joi';
import * as memoize from 'memoizee';
import * as request from 'request-promise';
import {AnalyticsEvent} from 'shared/schema/AnalyticsEvents';
import {PUBLIC_PARTITION} from 'shared/schema/Constants';
import {Feedback} from 'shared/schema/Feedback';
import {Quest} from 'shared/schema/Quests';
import Config from './config';
import {MailService} from './Mail';
import {Database, QuestInstance, RenderedQuestInstance} from './models/Database';
import {FeedbackType, submitFeedback, submitRating, submitReportQuest} from './models/Feedback';
import {getQuest, MAX_SEARCH_LIMIT, publishQuest, QuestSearchParams, searchQuests, unpublishQuest} from './models/Quests';
import {getUserQuests, UserQuestsType} from './models/Users';

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please contact support by emailing Expedition@Fabricate.io';
const REGEX_SEMVER = /[1-9][0-9]?[0-9]?\.[1-9][0-9]?[0-9]?\.[1-9][0-9]?[0-9]?/g;

export function healthCheck(req: express.Request, res: express.Response) {
  res.status(200).end(' ');
}

interface Versions {
  android: string;
  ios: string;
  web: string;
}

function getAndroidVersion(): Bluebird<string|null> {
  return request('https://play.google.com/store/apps/details?id=io.fabricate.expedition')
    .then((body: string) => {
      const $ = cheerio.load(body);
      const versionText = $('div:contains("Version")').text() || '';
      const result = REGEX_SEMVER.exec(versionText) || [];
      return result[0] || '1.0.0';
    })
    .catch((e: Error) => {
      return null;
    });
}

function getIosVersion(): Bluebird<string|null> {
  return request('http://itunes.apple.com/lookup?bundleId=io.fabricate.expedition')
    .then((body: string) => {
      const version = JSON.parse(body).results[0].version;
      return version;
    })
    .catch((e: Error) => {
      return null;
    });
}

function getWebVersion(): Bluebird<string|null> {
  return request('http://app.expeditiongame.com/package.json')
    .then((body: string) => {
      const version = JSON.parse(body).version;
      return version;
    })
    .catch((e: Error) => {
      return null;
    });
}

function getVersions(date: string): Bluebird<Versions> {
  return Bluebird.all([getAndroidVersion(), getIosVersion(), getWebVersion()])
    .then((values) => {
      return {
        android: values[0] || values[1] || '1.0.0', // Android scraping is fragile; fall back to iOS
        ios: values[1] || '1.0.0',
        web: values[2] || '1.0.0',
      };
    });
}

// TODO: Figure out why jest doesn't like importing memoizee
const memoizedVersions = (typeof(memoize) === 'function') ? memoize(getVersions, { promise: true }) : getVersions;

export function announcement(req: express.Request, res: express.Response) {
  memoizedVersions(new Date().toJSON().slice(0, 10)) // per day / 24 hour cache
    .then((versions: Versions) => {
      res.json({
        link: Config.get('ANNOUNCEMENT_LINK') || '',
        message: Config.get('ANNOUNCEMENT_MESSAGE') || '',
        versions,
      });
    });
}

export function search(db: Database, req: express.Request, res: express.Response) {
  let body: any;
  try {
    body = JSON.parse(req.body);
  } catch (e) {
    return res.status(500).end('Error reading request.');
  }
  const params: QuestSearchParams = {
    age: body.age,
    contentrating: body.contentrating,
    expansions: body.expansions,
    genre: body.genre,
    id: body.id,
    language: body.language,
    limit: body.limit,
    maxtimeminutes: body.maxtimeminutes,
    mintimeminutes: body.mintimeminutes,
    order: body.order,
    owner: body.owner,
    partition: body.partition || PUBLIC_PARTITION,
    players: body.players,
    requirespenpaper: body.requirespenpaper,
    text: body.text,
  };
  return searchQuests(db, res.locals.id, params)
  .then((quests: QuestInstance[]) => {
    // Map quest published URL to the API server so we can proxy quest data.
    const results: Quest[] = quests
      .map((q: QuestInstance) => Quest.create(q.dataValues))
      .filter((q: Quest|Error) => !(q instanceof Error))
      .map((q: Quest) => {
      q.publishedurl = (Config.get('API_URL_BASE') || 'http://api.expeditiongame.com') + `/raw/${q.partition}/${q.id}/${q.questversion}`;
      return q;
    });

    console.log('Found ' + quests.length + ' quests for user ' + res.locals.id);
    res.status(200).end(JSON.stringify({
      error: null,
      hasMore: (quests.length === (params.limit || MAX_SEARCH_LIMIT)),
      quests: results,
    }));
  })
  .catch((e: Error) => {
    console.error(e);
    return res.status(500).end(GENERIC_ERROR_MESSAGE);
  });
}

export function questXMLHandler(db: Database, req: express.Request, res: express.Response) {
  db.renderedQuests.findOne({where: {partition: req.params.partition, id: req.params.quest, questversion: req.params.version}})
  .then((instance: RenderedQuestInstance|null) => {
    if (!instance) {
      return getQuest(db, req.params.partition, req.params.quest)
        .then((q: Quest) => {
          const url = q.publishedurl;
          if (!url) {
            throw new Error('Quest did not have published URL');
          }
          res.header('Content-Type', 'text/xml');
          res.header('Location', url);
          res.status(301).end();
        });
    }
    res.header('Content-Type', 'text/xml');
    res.status(200).end(instance.get('xml'));
  })
  .catch((e: Error) => {
    console.error(e);
    return res.status(500).end(GENERIC_ERROR_MESSAGE);
  });
}

export function publish(db: Database, mail: MailService, req: express.Request, res: express.Response) {
  const quest = Quest.create({
    author: req.query.author,
    contentrating: req.query.contentrating,
    email: req.query.email,
    expansionhorror: req.query.expansionhorror || false,
    genre: req.query.genre,
    id: req.params.id,
    language: req.query.language || 'English',
    maxplayers: req.query.maxplayers,
    maxtimeminutes: req.query.maxtimeminutes,
    minplayers: req.query.minplayers,
    mintimeminutes: req.query.mintimeminutes,
    partition: req.query.partition || PUBLIC_PARTITION,
    requirespenpaper: req.query.requirespenpaper || false,
    summary: req.query.summary,
    theme: req.query.theme || 'base',
    title: req.query.title,
  });
  if (quest instanceof Error) {
    console.error(quest);
    return res.status(500).end(quest);
  }
  const majorRelease = (req.query.majorRelease === 'true');
  return publishQuest(db, mail, res.locals.id, majorRelease, quest, req.body)
  .then((q: QuestInstance) => {
    console.log('Published quest ' + q.get('id'));
    res.status(200).end(q.get('id'));
  })
  .catch((e: Error) => {
    console.error(e);
    return res.status(500).end(GENERIC_ERROR_MESSAGE);
  });
}

export function unpublish(db: Database, req: express.Request, res: express.Response) {
  return unpublishQuest(db, PUBLIC_PARTITION, req.params.quest)
  .then(() => {
    res.status(200).end('ok');
  })
  .catch((e: Error) => {
    console.error(e);
    return res.status(500).end(GENERIC_ERROR_MESSAGE);
  });
}

export function postAnalyticsEvent(db: Database, req: express.Request, res: express.Response) {
  let body: any;
  try {
    body = JSON.parse(req.body);
  } catch (e) {
    return res.status(500).end('Error reading request.');
  }

  return db.analyticsEvent.create(new AnalyticsEvent({
    action: req.params.action,
    category: req.params.category,
    difficulty: body.difficulty,
    json: (body.data) ? JSON.stringify(body.data) : undefined,
    platform: body.platform,
    players: body.players,
    questID: body.questid,
    questVersion: body.questversion,
    userID: body.userid,
    version: body.version,
  })).then(() => {
    res.status(200).end('ok');
  }).catch((e: Error) => {
    console.error(e);
    return res.status(500).end(GENERIC_ERROR_MESSAGE);
  });
}

export function feedback(db: Database, mail: MailService, req: express.Request, res: express.Response): Bluebird<any> {
  let body: any;
  try {
    body = JSON.parse(req.body);
  } catch (e) {
    console.error(e);
    res.status(400).end('Error reading request.');
    return Bluebird.reject('Error reading request');
  }

  // Partition & quest ID may not be populated if
  // feedback occurs outside of a quest.
  // The only thing we require is the user's ID.
  const data = Feedback.create({
    anonymous: body.anonymous,
    difficulty: body.difficulty,
    email: body.email,
    name: body.name,
    partition: body.partition || '',
    platform: body.platform,
    players: body.players,
    questid: body.questid || '',
    questversion: body.questversion,
    rating: body.rating || 0,
    text: body.text,
    userid: body.userid,
    version: body.version,
  });
  if (data instanceof Error) {
    console.error(data);
    res.status(400).end('Invalid request.');
    return Bluebird.reject('Invalid request');
  }
  const platformDump: string = body.platformDump;
  const consoleDump: string[] = body.console || [];
  let action: Bluebird<any>;
  switch (req.params.type as FeedbackType) {
    case 'feedback':
      action = submitFeedback(db, mail, req.params.type, data, platformDump, consoleDump);
      break;
    case 'rating':
      action = submitRating(db, mail, data);
      break;
    case 'report_error':
      action = submitFeedback(db, mail, req.params.type, data, platformDump, consoleDump);
      break;
    case 'report_quest':
      action = submitReportQuest(db, mail, data, platformDump);
      break;
    default:
      console.error('Unknown feedback type ' + req.params.type);
      res.status(500).end('Unknown feedback type: ' + req.params.type);
      return Bluebird.reject('Unknown feedback type');
  }
  return action.then(() => {
    res.status(200).end('ok');
  }).catch((e: Error) => {
    console.error(e);
    res.status(500).end(GENERIC_ERROR_MESSAGE);
    throw e;
  });
}

export function userQuests(db: Database, req: express.Request, res: express.Response) {
  return getUserQuests(db, res.locals.id)
  .then((userQuests: UserQuestsType) => {
    return res.status(200).end(JSON.stringify(userQuests));
  })
  .catch((e: Error) => {
    console.error(e);
    return res.status(500).end(GENERIC_ERROR_MESSAGE);
  });
}

export function subscribe(mailchimp: any, listId: string, req: express.Request, res: express.Response) {
  try {
    req.body = JSON.parse(req.body);
  } catch (e) {
    return res.status(400).end('Error reading request.');
  }
  Joi.validate(req.body.email, Joi.string().email().invalid(''), (e: Error, email: string) => {

    if (e) {
      return res.status(400).end('Valid email address required.');
    }

    // TODO: Move this logic into the mail.ts file.
    if (!mailchimp) {
      return res.status(200).end();
    } else {
      mailchimp.post('/lists/' + listId + '/members/', {
        email_address: email,
        merge_fields: { SOURCE: 'app' },
        status: 'pending',
      }, (result: any, err: Error) => {
        if (err) {
          const status = (err as any).status;
          if (status === 400) {
            return res.status(200).end(); // Already on the list - but that's ok!
          } else {
            console.log('Mailchimp error', err);
            return res.status(status).end((err as any).title);
          }
        }
        console.log(email + ' subscribed as pending to player list');
        return res.status(200).end();
      });
    }
  });
}

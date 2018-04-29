import * as Bluebird from 'bluebird'
import * as cheerio from 'cheerio'
import * as express from 'express'
import * as request from 'request-promise'
import * as memoize from 'memoizee'
import {AnalyticsEvent} from './models/AnalyticsEvents'
import {Feedback, FeedbackType} from './models/Feedback'
import {Quest, QuestInstance, QuestSearchParams, MAX_SEARCH_LIMIT} from './models/Quests'
import {Quest as QuestAttributes} from 'expedition-qdl/lib/schema/Quests'
import {Feedback as FeedbackAttributes} from 'expedition-qdl/lib/schema/Feedback'
import {PUBLIC_PARTITION} from 'expedition-qdl/lib/schema/Constants'
import {RenderedQuest, RenderedQuestInstance} from './models/RenderedQuests'
import * as Joi from 'joi'
import Config from './config'

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please contact support by emailing Expedition@Fabricate.io';
const REGEX_SEMVER = /[1-9][0-9]?[0-9]?\.[1-9][0-9]?[0-9]?\.[1-9][0-9]?[0-9]?/g;

export function healthCheck(req: express.Request, res: express.Response) {
  res.end(' ');
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
  memoizedVersions(new Date().toJSON().slice(0,10))
    .then((versions: Versions) => {
      res.json({
        message: Config.get('ANNOUNCEMENT_MESSAGE') || '',
        link: Config.get('ANNOUNCEMENT_LINK') || '',
        versions,
      });
    });
}

export function search(quest: Quest, req: express.Request, res: express.Response) {
  let body: any;
  try {
    body = JSON.parse(req.body);
  } catch (e) {
    return res.status(500).end('Error reading request.');
  }
  const params: QuestSearchParams = {
    id: body.id,
    owner: body.owner,
    players: body.players,
    text: body.text,
    age: body.age,
    mintimeminutes: body.mintimeminutes,
    maxtimeminutes: body.maxtimeminutes,
    contentrating: body.contentrating,
    genre: body.genre,
    order: body.order,
    limit: body.limit,
    partition: body.partition || PUBLIC_PARTITION,
    expansions: body.expansions,
    language: body.language,
  };
  quest.search(res.locals.id, params)
    .then((quests: QuestInstance[]) => {
      // Map quest published URL to the API server so we can proxy quest data.
      const results: QuestAttributes[] = quests.map(quest.resolveInstance).map((q: QuestAttributes) => {
        q.publishedurl = (Config.get('API_URL_BASE') || 'http://api.expeditiongame.com') + `/raw/${q.partition}/${q.id}/${q.questversion}`;
        return q;
      });

      console.log('Found ' + quests.length + ' quests for user ' + res.locals.id);
      res.end(JSON.stringify({
        error: null,
        quests: results,
        hasMore: (quests.length === (params.limit || MAX_SEARCH_LIMIT))}));
    })
    .catch((e: Error) => {
      console.error(e);
      return res.status(500).end(GENERIC_ERROR_MESSAGE);
    });
}

export function questXMLHandler(quest: Quest, renderedQuest: RenderedQuest, req: express.Request, res: express.Response) {
  renderedQuest.get(req.params.partition, req.params.quest, req.params.version)
    .then((instance: RenderedQuestInstance) => {
      if (!instance) {
        return quest.get(req.params.partition, req.params.quest)
          .then((instance: QuestInstance) => {
            const url = instance.get('publishedurl');
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

export function publish(quest: Quest, req: express.Request, res: express.Response) {
  const attribs: Partial<QuestAttributes> = {
    id: req.params.id,
    partition: req.query.partition || PUBLIC_PARTITION,
    title: req.query.title,
    summary: req.query.summary,
    author: req.query.author,
    email: req.query.email,
    minplayers: req.query.minplayers,
    maxplayers: req.query.maxplayers,
    mintimeminutes: req.query.mintimeminutes,
    maxtimeminutes: req.query.maxtimeminutes,
    genre: req.query.genre,
    contentrating: req.query.contentrating,
    expansionhorror: req.query.expansionhorror || false,
    language: req.query.language,
  };
  const majorRelease = (req.query.majorRelease === 'true');
  quest.publish(res.locals.id, majorRelease, attribs, req.body)
    .then((quest: QuestInstance) => {
      console.log('Published quest ' + quest.get('id'));
      res.end(quest.get('id'));
    })
    .catch((e: Error) => {
      console.error(e);
      return res.status(500).end(GENERIC_ERROR_MESSAGE);
    })
}

export function unpublish(quest: Quest, req: express.Request, res: express.Response) {
  quest.unpublish(PUBLIC_PARTITION, req.params.quest)
    .then(() => {
      res.end('ok');
    })
    .catch((e: Error) => {
      console.error(e);
      return res.status(500).end(GENERIC_ERROR_MESSAGE);
    });
}

export function postAnalyticsEvent(analyticsEvent: AnalyticsEvent, req: express.Request, res: express.Response) {
  let body: any;
  try {
    body = JSON.parse(req.body);
  } catch (e) {
    return res.status(500).end('Error reading request.');
  }

  analyticsEvent.create({
      category: req.params.category,
      action: req.params.action,
      quest_id: body.questid,
      user_id: body.userid,
      quest_version: body.questversion,
      difficulty: body.difficulty,
      platform: body.platform,
      players: body.players,
      version: body.version,
      json: (body.data) ? JSON.stringify(body.data) : undefined,
    }).then(() => {
      res.end('ok');
    }).catch((e: Error) => {
      console.error(e);
      return res.status(500).end(GENERIC_ERROR_MESSAGE);
    });
}

export function feedback(mail: any, feedback: Feedback, req: express.Request, res: express.Response): Bluebird<any> {
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
  const data = FeedbackAttributes.create({
    partition: body.partition || '',
    questid: body.questid || '',
    userid: body.userid,
    questversion: body.questversion,
    rating: body.rating || 0,
    text: body.text,
    email: body.email,
    name: body.name,
    difficulty: body.difficulty,
    platform: body.platform,
    players: body.players,
    version: body.version,
    anonymous: body.anonymous,
  });
  if (data instanceof Error) {
    console.error(data);
    res.status(400).end('Invalid request.');
    return Bluebird.reject('Invalid request');
  }
  const platformDump: string = body.platformDump;
  const consoleDump: string[] = body.console;
  let action: Bluebird<any>;
  switch (req.params.type as FeedbackType) {
    case 'feedback':
      action = feedback.submitFeedback(mail, req.params.type, data, platformDump, consoleDump);
      break;
    case 'rating':
      action = feedback.submitRating(mail, data);
      break;
    case 'report_error':
      action = feedback.submitFeedback(mail, req.params.type, data, platformDump, consoleDump);
      break;
    case 'report_quest':
      action = feedback.submitReportQuest(mail, data, platformDump);
      break;
    default:
      console.error('Unknown feedback type ' + req.params.type);
      res.status(500).end('Unknown feedback type: ' + req.params.type);
      return Bluebird.reject('Unknown feedback type');
  }
  return action.then(() => {
    res.end('ok');
  }).catch((e: Error) => {
    console.error(e);
    res.status(500).end(GENERIC_ERROR_MESSAGE);
    throw e;
  });
}

export function subscribe(mailchimp: any, listId: string, req: express.Request, res: express.Response) {
  try {
    req.body = JSON.parse(req.body);
  } catch(e) {
    return res.status(400).end('Error reading request.');
  }
  Joi.validate(req.body.email, Joi.string().email().invalid(''), (err: Error, email: string) => {

    if (err) {
      return res.status(400).end('Valid email address required.');
    }

    // TODO: Move this logic into the mail.ts file.
    if (!mailchimp) {
      return res.status(200).end();
    } else {
      mailchimp.post('/lists/' + listId + '/members/', {
        email_address: email,
        status: 'pending',
        merge_fields: {
          SOURCE: 'app',
        },
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
        console.error(email + ' subscribed as pending to player list');
        return res.status(200).end();
      });
    }
  });
}

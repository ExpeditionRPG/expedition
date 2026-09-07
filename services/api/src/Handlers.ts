import * as Bluebird from 'bluebird';
import * as cheerio from 'cheerio';
import * as express from 'express';
import * as Joi from 'joi';
import * as memoize from 'memoizee';
import * as request from 'request-promise';
import { AnalyticsEvent } from 'shared/schema/AnalyticsEvents';
import { Badge, Partition } from 'shared/schema/Constants';
import { Feedback } from 'shared/schema/Feedback';
import { QuestData } from 'shared/schema/QuestData';
import { Quest } from 'shared/schema/Quests';
import Config from './config';
import { MailService } from './Mail';
import {
  Database,
  QuestInstance,
  RenderedQuestInstance,
} from './models/Database';
import {
  submitFeedback,
  submitRating,
  submitReportQuest,
} from './models/Feedback';
import {
  claimNewestQuestData,
  saveQuestData as innerSaveQuestData,
} from './models/QuestData';
import {
  getQuest,
  MAX_SEARCH_LIMIT,
  publishQuest,
  QuestSearchParams,
  searchQuests,
  unpublishQuest,
} from './models/Quests';
import {
  getUserBadges,
  getUserFeedbacks,
  getUserQuests,
  IUserFeedback,
  maybeGetUserByEmail,
  UserQuestsType,
} from './models/Users';

const GENERIC_ERROR_MESSAGE =
  'Something went wrong. Please contact support by emailing Expedition@Fabricate.io';
const REGEX_SEMVER = /[1-9][0-9]?[0-9]?\.[1-9][0-9]?[0-9]?\.[1-9][0-9]?[0-9]?/g;

export function healthCheck(req: express.Request, res: express.Response) {
  res.status(200).end(' ');
}

interface Versions {
  android: string;
  ios: string;
  web: string;
}

function getAndroidVersion(): Bluebird<string | null> {
  return request(
    'https://play.google.com/store/apps/details?id=io.fabricate.expedition',
  )
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

function getIosVersion(): Bluebird<string | null> {
  return request(
    'http://itunes.apple.com/lookup?bundleId=io.fabricate.expedition',
  )
    .then((body: string) => {
      const version = JSON.parse(body).results[0].version;
      return version;
    })
    .catch((e: Error) => {
      return null;
    });
}

function getWebVersion(): Bluebird<string | null> {
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
  return Bluebird.all([
    getAndroidVersion(),
    getIosVersion(),
    getWebVersion(),
  ]).then(values => {
    return {
      android: values[0] || values[1] || '1.0.0', // Android scraping is fragile; fall back to iOS
      ios: values[1] || '1.0.0',
      web: values[2] || '1.0.0',
    };
  });
}

function proxifyQuestURL(q: Quest) {
  q.publishedurl =
    (Config.get('API_URL_BASE') || 'http://api.expeditiongame.com') +
    `/raw/${q.partition}/${q.id}/${q.questversion}`;
}

// TODO: Figure out why jest doesn't like importing memoizee
const memoizedVersions =
  typeof memoize === 'function'
    ? memoize(getVersions, { promise: true })
    : getVersions;

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

export function qcAnnouncement(req: express.Request, res: express.Response) {
  return res.json({
    link: Config.get('QC_ANNOUNCEMENT_LINK') || '',
    message: Config.get('QC_ANNOUNCEMENT_MESSAGE') || '',
  });
}

export interface QuestSearchResponse {
  error: null | string;
  hasMore: boolean;
  quests: Quest[];
}
function doSearch(
  db: Database,
  userId: string,
  params: QuestSearchParams,
): Promise<QuestSearchResponse> {
  return searchQuests(db, userId, params)
    .then((quests: QuestInstance[]) => {
      // Map quest published URL to the API server so we can proxy quest data.
      const results: Quest[] = quests
        .map((q: QuestInstance) => Quest.create(q.dataValues))
        .filter((q: Quest | Error): q is Quest => !(q instanceof Error))
        .map((q: Quest) => {
          proxifyQuestURL(q);
          return q;
        });

      console.log(
        `Found ${
          quests.length
        } quests for user ${userId}, params: ${JSON.stringify(params)}`,
      );
      return {
        error: null,
        hasMore: quests.length === (params.limit || MAX_SEARCH_LIMIT),
        quests: results,
      };
    })
    .catch((e: Error) => {
      console.error(e);
      return {
        error: e.toString(),
        hasMore: false,
        quests: [],
      };
    });
}
export function search(
  db: Database,
  req: express.Request,
  res: express.Response,
) {
  let body: any;
  try {
    body = JSON.parse(req.body);
  } catch (e) {
    return res.status(500).end({ error: 'Could not parse request.' });
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
    partition: body.partition || Partition.expeditionPublic,
    players: body.players,
    requirespenpaper: body.requirespenpaper,
    text: body.text,
    showPrivate: body.showPrivate,
    showOfficial: body.showOfficial,
  };

  return doSearch(db, res.locals.id, params).then(result => {
    res.status(result.error ? 500 : 200).end(JSON.stringify(result));
  });
}

export function questXMLHandler(
  db: Database,
  req: express.Request,
  res: express.Response,
) {
  db.renderedQuests
    .findOne({
      where: {
        partition: req.params.partition,
        id: req.params.quest,
        questversion: req.params.version,
      },
    })
    .then((instance: RenderedQuestInstance | null) => {
      if (!instance) {
        return getQuest(db, req.params.partition, req.params.quest).then(
          (q: Quest) => {
            const url = q.publishedurl;
            if (!url) {
              throw new Error('Quest did not have published URL');
            }
            res.header('Content-Type', 'text/xml');
            res.header('Location', url);
            res.status(301).end();
          },
        );
      }
      res.header('Content-Type', 'text/xml');
      res.status(200).end(instance.get('xml'));
    })
    .catch((e: Error) => {
      console.error(e);
      return res.status(500).end(GENERIC_ERROR_MESSAGE);
    });
}

export function loadQuestData(
  db: Database,
  req: express.Request,
  res: express.Response,
) {
  return claimNewestQuestData(
    db,
    req.params.quest,
    res.locals.id,
    new Date(parseInt(req.params.edittime, 10)),
  )
    .then((instance: QuestData | null) => {
      if (!instance) {
        return res.status(404).end('not found');
      }
      return res.status(200).end(
        JSON.stringify({
          data: instance.data,
          notes: instance.notes,
          metadata: JSON.parse(instance.metadata),
        }),
      );
    })
    .catch((e: Error) => {
      console.error(e);
      return res.status(500).end(GENERIC_ERROR_MESSAGE);
    });
}

export function saveQuestData(
  db: Database,
  req: express.Request,
  res: express.Response,
) {
  let parsed: {
    data: string;
    notes: string;
    metadata: string;
    edittime: Date;
  } = { data: '', notes: '', metadata: '', edittime: new Date() };
  if (res.header) {
    res.header('Access-Control-Allow-Origin', req.get('origin'));
  }
  try {
    parsed = JSON.parse(req.body);
    parsed.edittime = new Date(parsed.edittime);
  } catch (e) {
    console.error(e);
    return res.status(500).end('Error reading request.');
  }
  return innerSaveQuestData(
    db,
    new QuestData({
      id: req.params.id,
      userid: res.locals.id,
      data: parsed.data,
      notes: parsed.notes,
      metadata: JSON.stringify(parsed.metadata || {}),
      created: new Date(),
      edittime: parsed.edittime,
    }),
  )
    .then(() => {
      res.status(200).end('ok');
    })
    .catch((e: Error) => {
      console.error(e);
      if (e.toString().startsWith('Error: Edit time mismatch')) {
        return res
          .status(409)
          .send(
            'quest is being edited elsewhere. Reload to take over the editing session.',
          );
      }
      return res.status(500).end(GENERIC_ERROR_MESSAGE);
    });
}

// Express types every query value as
// `string | string[] | ParsedQs | ParsedQs[] | undefined` -- a caller can
// repeat a parameter or send `?a[b]=c` and get an array or a nested object.
// Every parameter this API publishes is a scalar, so anything else is a
// malformed request and reads as absent, which is what the schema defaults
// already handle.
function queryString(
  query: express.Request['query'],
  key: string,
): string | undefined {
  const value = query[key];
  return typeof value === 'string' ? value : undefined;
}

function queryNumber(
  query: express.Request['query'],
  key: string,
): number | undefined {
  const value = queryString(query, key);
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  return isNaN(parsed) ? undefined : parsed;
}

// Query strings carry 'true'/'false', which Joi used to coerce for us.
function queryBoolean(query: express.Request['query'], key: string): boolean {
  return queryString(query, key) === 'true';
}

export function publish(
  db: Database,
  mail: MailService,
  req: express.Request,
  res: express.Response,
) {
  const query = req.query;
  const quest = Quest.create({
    author: queryString(query, 'author'),
    contentrating: queryString(query, 'contentrating'),
    email: queryString(query, 'email'),
    expansionhorror: queryBoolean(query, 'expansionhorror'),
    expansionfuture: queryBoolean(query, 'expansionfuture'),
    expansionwyrmsgiants: queryBoolean(query, 'expansionwyrmsgiants'),
    expansionscarredlands: queryBoolean(query, 'expansionscarredlands'),
    genre: queryString(query, 'genre'),
    id: req.params.id,
    language: queryString(query, 'language') || 'English',
    maxplayers: queryNumber(query, 'maxplayers'),
    maxtimeminutes: queryNumber(query, 'maxtimeminutes'),
    minplayers: queryNumber(query, 'minplayers'),
    mintimeminutes: queryNumber(query, 'mintimeminutes'),
    partition: queryString(query, 'partition') || Partition.expeditionPublic,
    requirespenpaper: queryBoolean(query, 'requirespenpaper'),
    summary: queryString(query, 'summary'),
    theme: queryString(query, 'theme') || 'base',
    title: queryString(query, 'title'),
  });
  if (quest instanceof Error) {
    console.error(quest);
    return res.status(500).end(quest);
  }
  const majorRelease = req.query.majorRelease === 'true';
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

export function unpublish(
  db: Database,
  req: express.Request,
  res: express.Response,
) {
  return unpublishQuest(db, Partition.expeditionPublic, req.params.quest)
    .then(() => {
      res.status(200).end('ok');
    })
    .catch((e: Error) => {
      console.error(e);
      return res.status(500).end(GENERIC_ERROR_MESSAGE);
    });
}

export function postAnalyticsEvent(
  db: Database,
  req: express.Request,
  res: express.Response,
) {
  let body: any;
  try {
    body = JSON.parse(req.body);
  } catch (e) {
    return res.status(500).end('Error reading request.');
  }

  return db.analyticsEvent
    .create(
      new AnalyticsEvent({
        action: req.params.action,
        category: req.params.category,
        difficulty: body.difficulty,
        json: body.data ? JSON.stringify(body.data) : undefined,
        platform: body.platform,
        players: body.players,
        questID: body.questid,
        questVersion: body.questversion,
        userID: body.userid,
        version: body.version,
      }),
    )
    .then(() => {
      res.status(200).end('ok');
    })
    .catch((e: Error) => {
      console.error(e);
      return res.status(500).end(GENERIC_ERROR_MESSAGE);
    });
}

export function feedback(
  db: Database,
  mail: MailService,
  req: express.Request,
  res: express.Response,
): Promise<any> {
  let body: any;
  try {
    body = JSON.parse(req.body);
  } catch (e) {
    console.error(e);
    res.status(400).end('Error reading request.');
    return Promise.reject('Error reading request');
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
    questline: body.questline || 0,
    questversion: body.questversion,
    rating: body.rating || 0,
    text: body.text,
    userid: body.userid,
    version: body.version,
    stats: body.stats,
  });
  if (data instanceof Error) {
    console.error(data);
    res.status(400).end('Invalid request.');
    return Promise.reject('Invalid request');
  }
  const platformDump: string = body.platformDump;
  const consoleDump: string[] = body.console || [];
  let action: Promise<any> = maybeGetUserByEmail(db, data.email);
  // Narrowed by the cases below, so each branch passes a literal that is
  // already a FeedbackType; anything else falls through to `default`.
  const feedbackType = req.params.type;
  switch (feedbackType) {
    case 'feedback':
      action = action.then(user =>
        submitFeedback(
          db,
          mail,
          feedbackType,
          data,
          platformDump,
          consoleDump,
          user,
        ),
      );
      break;
    case 'rating':
      action = action.then(user => submitRating(db, mail, data, user));
      break;
    case 'report_error':
      action = action.then(user =>
        submitFeedback(
          db,
          mail,
          feedbackType,
          data,
          platformDump,
          consoleDump,
          user,
        ),
      );
      break;
    case 'report_quest':
      action = action.then(user =>
        submitReportQuest(db, mail, data, platformDump, user),
      );
      break;
    default:
      console.error('Unknown feedback type ' + feedbackType);
      res.status(500).end('Unknown feedback type: ' + feedbackType);
      return Promise.reject('Unknown feedback type');
  }
  return action
    .then(() => {
      res.status(200).end('ok');
    })
    .catch((e: Error) => {
      console.error(e);
      res.status(500).end(GENERIC_ERROR_MESSAGE);
      throw e;
    });
}

export function userQuests(
  db: Database,
  req: express.Request,
  res: express.Response,
) {
  return getUserQuests(db, res.locals.id)
    .then((quests: UserQuestsType) => {
      for (const k of Object.keys(quests)) {
        proxifyQuestURL(quests[k].details);
      }
      return res.status(200).end(JSON.stringify(quests));
    })
    .catch((e: Error) => {
      console.error(e);
      return res.status(500).end(GENERIC_ERROR_MESSAGE);
    });
}

export function subscribe(
  mailchimp: any,
  listId: string,
  req: express.Request,
  res: express.Response,
) {
  try {
    req.body = JSON.parse(req.body);
  } catch (e) {
    return res.status(400).end('Error reading request.');
  }
  Joi.validate(
    req.body.email,
    Joi.string()
      .email()
      .invalid(''),
    (e: Error, email: string) => {
      if (e) {
        return res.status(400).end('Valid email address required.');
      }

      // TODO: Move this logic into the mail.ts file.
      if (!mailchimp) {
        return res.status(200).end();
      } else {
        mailchimp.post(
          '/lists/' + listId + '/members/',
          {
            email_address: email,
            merge_fields: { SOURCE: 'app' },
            status: 'pending',
          },
          (result: any, err: Error) => {
            if (err) {
              const status = (err as any).status;
              if (status === 400) {
                console.log(
                  `Mailchimp 400 subscribing ${email}: ${(err as any).detail}`,
                );
                return res.status(200).end(); // Already on the list - but that's ok!
              } else {
                console.log('Mailchimp error', err);
                return res.status(status).end((err as any).title);
              }
            }
            console.log(email + ' subscribed as pending to player list');
            return res.status(200).end();
          },
        );
      }
    },
  );
}

export function userFeedbacks(
  db: Database,
  req: express.Request,
  res: express.Response,
) {
  return getUserFeedbacks(db, res.locals.id)
    .then((feedbacks: IUserFeedback[]) =>
      res.status(200).end(JSON.stringify(feedbacks)),
    )
    .catch((e: Error) => {
      console.error(e);
      return res.status(500).end(GENERIC_ERROR_MESSAGE);
    });
}

export function userBadges(
  db: Database,
  req: express.Request,
  res: express.Response,
) {
  return getUserBadges(db, res.locals.id)
    .then((badges: Badge[]) => res.status(200).end(JSON.stringify(badges)))
    .catch((e: Error) => {
      console.error(e);
      return res.status(500).end(GENERIC_ERROR_MESSAGE);
    });
}

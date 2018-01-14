import * as express from 'express'
import {AnalyticsEvent} from './models/AnalyticsEvents'
import {Feedback, FeedbackType, FeedbackAttributes} from './models/Feedback'
import {Quest, QuestInstance, QuestAttributes, QuestSearchParams, MAX_SEARCH_LIMIT, PUBLIC_PARTITION} from './models/Quests'

const Joi = require('joi');

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please contact support by emailing Expedition@Fabricate.io';

export function healthCheck(req: express.Request, res: express.Response) {
  res.send(' ');
}

export function announcement(req: express.Request, res: express.Response) {
  res.json({
    message: 'Click here to vote on the best new quest!',
    link: 'https://goo.gl/forms/V9YpbzCl5a7ZGxJF2',
  });
}

export function search(quest: Quest, req: express.Request, res: express.Response) {
  if (!res.locals || !res.locals.id) {
    return res.send(JSON.stringify([]));
  }
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
  };
  quest.search(res.locals.id, params)
    .then((quests: QuestInstance[]) => {
      const results = quests.map((q: QuestInstance) => {
        return q.dataValues;
      });

      console.log('Found ' + quests.length + ' quests for user ' + res.locals.id);
      res.send(JSON.stringify({
        error: null,
        quests: results,
        hasMore: (quests.length === (params.limit || MAX_SEARCH_LIMIT))}));
    })
    .catch((e: Error) => {
      console.error(e);
      return res.status(500).send(GENERIC_ERROR_MESSAGE);
    });
}

export function questXMLRedirect(quest: Quest, req: express.Request, res: express.Response) {
  quest.get(PUBLIC_PARTITION, req.params.quest)
    .then((quest: QuestInstance) => {
      res.header('Content-Type', 'text/xml');
      res.header('Location', quest.dataValues.url);
      res.status(301).end();
    })
    .catch((e: Error) => {
      console.error(e);
      return res.status(500).send(GENERIC_ERROR_MESSAGE);
    });
}

export function publish(quest: Quest, req: express.Request, res: express.Response) {
  if (!res.locals || !res.locals.id) {
    return res.status(500).end('You are not signed in. Please sign in (by refreshing the page) to save your quest.');
  }

  const attribs: QuestAttributes = {
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
  };
  const majorRelease = req.query.majorRelease || false;

  quest.publish(res.locals.id, majorRelease, attribs, req.body)
    .then((quest: QuestInstance) => {
      console.log('Published quest ' + quest.dataValues.id);
      res.end(quest.dataValues.id);
    })
    .catch((e: Error) => {
      console.error(e);
      return res.status(500).send(GENERIC_ERROR_MESSAGE);
    })
}

export function unpublish(quest: Quest, req: express.Request, res: express.Response) {
  if (!res.locals || !res.locals.id) {
    return res.status(500).end('You are not signed in. Please sign in (by refreshing the page) to save your quest.');
  }

  quest.unpublish(PUBLIC_PARTITION, req.params.quest)
    .then(() => {
      res.end('ok');
    })
    .catch((e: Error) => {
      console.error(e);
      return res.status(500).send(GENERIC_ERROR_MESSAGE);
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
    }).then(() => {
      res.end('ok');
    }).catch((e: Error) => {
      console.error(e);
      return res.status(500).send(GENERIC_ERROR_MESSAGE);
    });
}

export function feedback(feedback: Feedback, req: express.Request, res: express.Response) {
  let body: any;
  try {
    body = JSON.parse(req.body);
  } catch (e) {
    return res.status(500).end('Error reading request.');
  }
  const data: FeedbackAttributes = {
    partition: body.partition || PUBLIC_PARTITION,
    questid: body.questid,
    userid: body.userid,
    questversion: body.questversion,
    created: body.created,
    rating: body.rating,
    text: body.text,
    email: body.email,
    name: body.name,
    difficulty: body.difficulty,
    platform: body.platform,
    platformDump: body.platformDump,
    players: body.players,
    version: body.version,
  }

  let handler = null;
  switch (req.params.type as FeedbackType) {
    case 'feedback':
      handler = feedback.submitFeedback.bind(feedback);
      break;
    case 'rating':
      handler = feedback.submitRating.bind(feedback);
      break;
    case 'report_error':
      handler = feedback.submitReportError.bind(feedback);
      break;
    case 'report_quest':
      handler = feedback.submitReportQuest.bind(feedback);
      break;
    default:
      return res.status(500).end('Unknown feedback type: ' + req.params.type);
  }

  handler(data)
    .then((id: string) => {
      res.end('ok');
    }).catch((e: Error) => {
      console.error(e);
      return res.status(500).send(GENERIC_ERROR_MESSAGE);
    });
}

export function subscribe(mailchimp: any, listId: string, req: express.Request, res: express.Response) {
  req.body = JSON.parse(req.body);
  Joi.validate(req.body.email, Joi.string().email().invalid(''), (err: Error, email: string) => {

    if (err) {
      return res.status(400).send('Valid email address required.');
    }

    // TODO: Move this logic into the mail.ts file.
    if (!mailchimp) {
      return res.status(200).send();
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
            return res.status(200).send(); // Already on the list - but that's ok!
          } else {
            console.log('Mailchimp error', err);
            return res.status(status).send((err as any).title);
          }
        }
        console.error(email + ' subscribed as pending to player list');
        return res.status(200).send();
      });
    }
  });
}

import * as express from 'express'
import {Quest, QuestInstance, QuestAttributes, QuestSearchParams, MAX_SEARCH_LIMIT} from './models/Quests'
import {Feedback, FeedbackType, FeedbackAttributes} from './models/Feedback'

const Joi = require('joi');

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please contact support by emailing Expedition@Fabricate.io';

// Use this partition for any operations on public-facing quests.
const PUBLIC_PARTITION = 'expedition-public';

export function healthCheck(req: express.Request, res: express.Response) {
  res.send(' ');
}

export function announcement(req: express.Request, res: express.Response) {
  res.json({
    message: 'The first expansion is now on Kickstarter! Click here to check it out',
    link: 'https://ExpeditionGame.com/kickstarter',
  });
}

export function search(quest: Quest, req: express.Request, res: express.Response) {
  if (!res.locals || !res.locals.id) {
    return res.send(JSON.stringify([]));
  }
  const params: QuestSearchParams = {
    id: req.body.id,
    owner: req.body.owner,
    players: req.body.players,
    search: req.body.search,
    text: req.body.text,
    age: req.body.age,
    mintimeminutes: req.body.mintimeminutes,
    maxtimeminutes: req.body.maxtimeminutes,
    contentrating: req.body.contentrating,
    genre: req.body.genre,
    order: req.body.order,
    limit: req.body.limit,
  };
  quest.search(PUBLIC_PARTITION, res.locals.id, params)
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
      console.log(e);
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
      console.log(e);
      return res.status(500).send(GENERIC_ERROR_MESSAGE);
    });
}

export function publish(quest: Quest, req: express.Request, res: express.Response) {
  if (!res.locals.id) {
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
  };
  const majorRelease = req.query.majorRelease || false;

  quest.publish(res.locals.id, majorRelease, attribs, req.body)
    .then((id: string) => {
      console.log('Published quest ' + id);
      res.end(id);
    })
    .catch((e: Error) => {
      console.log(e);
      return res.status(500).send(GENERIC_ERROR_MESSAGE);
    })
}

export function unpublish(quest: Quest, req: express.Request, res: express.Response) {
  if (!res.locals.id) {
    return res.status(500).end('You are not signed in. Please sign in (by refreshing the page) to save your quest.');
  }

  quest.unpublish(PUBLIC_PARTITION, req.params.quest)
    .then(() => {
      res.end('ok');
    })
    .catch((e: Error) => {
      console.log(e);
      return res.status(500).send(GENERIC_ERROR_MESSAGE);
    });
});

export function feedback(feedback: Feedback, req: express.Request, res: express.Response) {

  const type: FeedbackType = req.params.type;
  if (req.params.type !== 'rating' && req.params.type !== 'report') {
    return res.status(500).end('Unknown feedback type: ' + req.params.type);
  }

  const attribs: FeedbackAttributes = {
    partition: req.body.partition,
    questid: req.body.questid,
    userid: req.body.userid,
    questversion: req.body.questversion,
    created: req.body.created,
    rating: req.body.rating,
    text: req.body.text,
    email: req.body.email,
    name: req.body.name,
    difficulty: req.body.difficulty,
    platform: req.body.platform,
    players: req.body.players,
    version: req.body.version,
  }

  feedback.submit(type, attribs)
    .then((id: string) => {
      res.end('ok');
    }).catch((e: Error) => {
      console.log(e);
      return res.status(500).send(GENERIC_ERROR_MESSAGE);
    });
});

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
        console.log(email + ' subscribed as pending to player list');
        return res.status(200).send();
      });
    }
  });
}

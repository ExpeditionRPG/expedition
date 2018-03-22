import * as express from 'express'
import {Feedback, FeedbackInstance} from '../models/Feedback'
import {Quest, QuestInstance} from '../models/Quests'
import {User, UserAttributes} from '../models/Users'
import * as QT from './QueryTypes'

const QUERY_ROW_LIMIT = 100;
const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please contact support by emailing Expedition@Fabricate.io';

function validateOrder(body: any) {
  if (body.order && (!body.order.column || !body.order.ascending)) {
    throw new Error('Invalid query order');
  }
  return body;
}

export function queryFeedback(feedback: Feedback, quests: Quest, users: User, req: express.Request, res: express.Response) {
  try {
    let body: any;
    body = validateOrder(JSON.parse(req.body));
    if (body.rating) {
      if (!body.rating.condition || !body.rating.value) {
        throw new Error('Invalid query rating');
      }
      if (body.rating.condition.length !== 1 || '><='.indexOf(body.rating.condition) === -1) {
        throw new Error('Invalid query rating condition');
      }
    }

    const q: QT.FeedbackQuery = {
      questid: body.questid || null,
      userid: body.userid || null,
      rating: body.rating || null,
      substring: body.substring || null,
    };

    const where: any = {};
    if (q.questid) {
      where.questid = q.questid;
    }
    if (q.userid) {
      where.userid = q.userid;
    }
    if (q.rating) {
      where.rating = {
        $gt: ((q.rating.condition === '>') ? q.rating.value : undefined),
        $lt: ((q.rating.condition === '<') ? q.rating.value : undefined),
        $eq: ((q.rating.condition === '=') ? q.rating.value : undefined),
      };
    }
    if (q.substring) {
      where.$or = [
        {text: {$contains: [q.substring]}},
        {email: {$contains: [q.substring]}},
        {name: {$contains: [q.substring]}},
      ];
    }

    return feedback.model.findAll({
      where,
      order: (q.order) ? [q.order.column, (q.order.ascending) ? 'ASC' : 'DESC'] : undefined,
      limit: QUERY_ROW_LIMIT,
    }).then((results: FeedbackInstance[]) => {
      return Promise.all(results.map((r: FeedbackInstance) => {
        return quests.get(r.get('partition'), r.get('questid'))
          .then((q: QuestInstance|null) => {
            if (!q) {
              return null;
            }
            return {
              partition: r.get('partition'),
              quest: {
                id: r.get('questid'),
                title: q.get('title')
              },
              user: {
                id: r.get('userid'),
                email: r.get('email'),
              },
              text: r.get('text'),
              rating: r.get('rating'),
            } as QT.FeedbackEntry;
          });
      }));
    }).then((results: (QT.FeedbackEntry|null)[]) => {
      return results.filter((r: QT.FeedbackEntry|null) => {
        return r !== null;
      })
    }).then((results: QT.FeedbackEntry[]) => {
      res.status(200).send(JSON.stringify(results));
    });
  } catch (e) {
    console.error(e);
    return res.status(500).end('Error reading request.');
  }
}

export function modifyFeedback(feedback: Feedback, req: express.Request, res: express.Response) {
  console.error('Unimplemented');
  return res.status(500).send(GENERIC_ERROR_MESSAGE);
}

export function queryQuest(quest: Quest, req: express.Request, res: express.Response) {
  console.error('Unimplemented');
  return res.status(500).send(GENERIC_ERROR_MESSAGE);
}

export function modifyQuest(quest: Quest, req: express.Request, res: express.Response) {
  console.error('Unimplemented');
  return res.status(500).send(GENERIC_ERROR_MESSAGE);
}

export function queryUser(user: User, req: express.Request, res: express.Response) {
  console.error('Unimplemented');
  return res.status(500).send(GENERIC_ERROR_MESSAGE);
}

export function modifyUser(user: User, req: express.Request, res: express.Response) {
  console.error('Unimplemented');
  return res.status(500).send(GENERIC_ERROR_MESSAGE);
}

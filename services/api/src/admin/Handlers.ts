import * as express from 'express'
import {suppressFeedback} from '../models/Feedback'
import {Database, QuestInstance, FeedbackInstance, UserInstance} from '../models/Database'
import {setLootPoints} from '../models/Users'
import {unpublishQuest, republishQuest, getQuest} from '../models/Quests'
import {Quest} from 'shared/schema/Quests'
import * as QT from './QueryTypes'

const QUERY_ROW_LIMIT = 100;

function validateOrder(body: any) {
  if (body.order && (!body.order.column || body.order.ascending === undefined)) {
    throw new Error('Invalid query order');
  }
  return body;
}

function handleErrors(res: express.Response) {
  return (e: Error) => {
    console.error(e);
    res.status(500).send(JSON.stringify({status: 'ERROR', error: e.toString()} as QT.Response));
  };
}

export function queryFeedback(db: Database, req: express.Request, res: express.Response) {
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
      order: body.order || null,
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
        {text: {$regexp: q.substring}},
        {email: {$regexp: q.substring}},
        {name: {$regexp: q.substring}},
      ];
    }

    return db.feedback.findAll({
      where,
      order: (q.order) ? [[q.order.column, (q.order.ascending) ? 'ASC' : 'DESC']] : undefined,
      limit: QUERY_ROW_LIMIT,
    }).then((results: FeedbackInstance[]) => {
      return Promise.all(results.map((r: FeedbackInstance) => {
        return getQuest(db, r.get('partition'), r.get('questid'))
          .then((q: Quest) => {
            return {
              partition: r.get('partition'),
              quest: {
                id: r.get('questid'),
                title: q.title,
              },
              user: {
                id: r.get('userid'),
                email: r.get('email'),
              },
              text: r.get('text'),
              rating: r.get('rating'),
              suppressed: r.get('tombstone') !== null,
            } as QT.FeedbackEntry;
          });
      }));
    }).then((results: (QT.FeedbackEntry|null)[]) => {
      return results.filter((r: QT.FeedbackEntry|null) => {
        return r !== null;
      })
    }).then((results: QT.FeedbackEntry[]) => {
      res.status(200).send(JSON.stringify(results));
    }).catch(handleErrors(res));
  } catch (e) {
    handleErrors(res)(e);
  }
}

export function modifyFeedback(db: Database, req: express.Request, res: express.Response) {
  try {
    let body: any;
    body = JSON.parse(req.body);

    const m: QT.FeedbackMutation = {
      partition: body.partition || null,
      questid: body.questid || null,
      userid: body.userid || null,
      suppress: body.suppress,
    };

    if (m.suppress !== null) {
      return suppressFeedback(db, m.partition, m.questid, m.userid, m.suppress || false)
        .then(() => {
          res.status(200).send(JSON.stringify({status: 'OK'} as QT.Response));
        }).catch(handleErrors(res));
    }
  } catch (e) {
    handleErrors(res)(e);
  }
}

export function queryQuest(db: Database, req: express.Request, res: express.Response) {
  try {
    let body: any;
    body = validateOrder(JSON.parse(req.body));

    const q: QT.QuestQuery = {
      questid: body.questid || null,
      userid: body.userid || null,
      substring: body.substring || null,
      order: body.order || null,
    };

    const where: any = {};
    if (q.questid) {
      where.id = q.questid;
    }
    if (q.userid) {
      where.userid = q.userid;
    }
    if (q.substring) {
      where.$or = [
        {title: {$regexp: q.substring}},
        {summary: {$regexp: q.substring}},
      ];
    }

    return db.quests.findAll({
      where,
      order: (q.order) ? [[q.order.column, (q.order.ascending) ? 'ASC' : 'DESC']] : undefined,
      limit: QUERY_ROW_LIMIT,
    }).then((results: QuestInstance[]) => {
      return results.map((r: QuestInstance) => {
        return {
          id: r.get('id'),
          title: r.get('title'),
          partition: r.get('partition'),
          ratingavg: r.get('ratingavg'),
          ratingcount: r.get('ratingcount'),
          user: {
            id: r.get('userid'),
            email: r.get('email'),
          },
          published: (!r.get('tombstone') && r.get('published') !== null),
        } as QT.QuestEntry;
      });
    }).then((results: QT.QuestEntry[]) => {
      res.status(200).send(JSON.stringify(results));
    }).catch(handleErrors(res));
  } catch (e) {
    handleErrors(res)(e);
  }
}

export function modifyQuest(db: Database, req: express.Request, res: express.Response) {
  try {
    let body: any;
    body = JSON.parse(req.body);

    const m: QT.QuestMutation = {
      partition: body.partition || null,
      questid: body.questid || null,
      published: (body.published !== undefined) ? body.published : null,
    };

    if (m.published === true) {
      return republishQuest(db, m.partition, m.questid)
        .then(() => {
          res.status(200).send(JSON.stringify({status: 'OK'} as QT.Response));
        }).catch(handleErrors(res));
    } else if (m.published === false) {
      return unpublishQuest(db, m.partition, m.questid)
        .then(() => {
          res.status(200).send(JSON.stringify({status: 'OK'} as QT.Response));
        }).catch(handleErrors(res));
    }
    throw Error('invalid modifier');
  } catch (e) {
    handleErrors(res)(e);
  }
}

export function queryUser(db: Database, req: express.Request, res: express.Response) {
  try {
    let body: any;
    body = validateOrder(JSON.parse(req.body));
    const q: QT.UserQuery = {
      userid: body.userid || null,
      substring: body.substring || null,
      order: body.order || null,
    };

    const where: any = {};
    if (q.userid) {
      where.userid = q.userid;
    }
    if (q.substring) {
      where.$or = [
        {email: {$regexp: q.substring}},
        {name: {$regexp: q.substring}},
      ];
    }

    return db.users.findAll({
      where,
      order: (q.order) ? [[q.order.column, (q.order.ascending) ? 'ASC' : 'DESC']] : undefined,
      limit: QUERY_ROW_LIMIT,
    }).then((results: UserInstance[]) => {
      return results.map((r: UserInstance) => {
        return {
          id: r.get('id'),
          email: r.get('email'),
          name: r.get('name'),
          loot_points: r.get('lootPoints'),
          last_login: r.get('lastLogin'),
        } as QT.UserEntry;
      });
    }).then((results: QT.UserEntry[]) => {
      res.status(200).send(JSON.stringify(results));
    }).catch(handleErrors(res));
  } catch (e) {
    handleErrors(res)(e);
  }
}

export function modifyUser(db: Database, req: express.Request, res: express.Response) {
  try {
    let body: any;
    body = JSON.parse(req.body);

    const m: QT.UserMutation = {
      userid: body.userid || null,
      loot_points: body.loot_points || null,
    };

    if (m.loot_points) {
      return setLootPoints(db, m.userid, m.loot_points)
        .then(() => {
          res.status(200).send(JSON.stringify({status: 'OK'} as QT.Response));
        }).catch(handleErrors(res));
    }
  } catch (e) {
    handleErrors(res)(e);
  }
}

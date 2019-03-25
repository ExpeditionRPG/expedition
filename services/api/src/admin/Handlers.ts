import * as Bluebird from 'bluebird';
import * as express from 'express';
import { Quest } from 'shared/schema/Quests';
import {
  Database,
  FeedbackInstance,
  QuestInstance,
  UserInstance,
} from '../models/Database';
import { suppressFeedback } from '../models/Feedback';
import {
  getQuest,
  republishQuest,
  unpublishQuest,
  updateQuestRatings,
} from '../models/Quests';
import { setLootPoints } from '../models/Users';
import * as QT from './QueryTypes';

const QUERY_ROW_LIMIT = 100;

function validateOrder(body: any) {
  if (
    body.order &&
    (!body.order.column || body.order.ascending === undefined)
  ) {
    throw new Error('Invalid query order');
  }
  return body;
}

function handleErrors(res: express.Response) {
  return (e: Error) => {
    console.error(e);
    res
      .status(500)
      .send(
        JSON.stringify({ status: 'ERROR', error: e.toString() } as QT.Response),
      );
  };
}

export function queryFeedback(
  db: Database,
  req: express.Request,
  res: express.Response,
) {
  try {
    let body: any;
    body = validateOrder(JSON.parse(req.body));
    if (body.rating) {
      if (!body.rating.condition || !body.rating.value) {
        throw new Error('Invalid query rating');
      }
      if (
        body.rating.condition.length !== 1 ||
        '><='.indexOf(body.rating.condition) === -1
      ) {
        throw new Error('Invalid query rating condition');
      }
    }

    const q: QT.FeedbackQuery = {
      order: body.order || null,
      questid: body.questid || null,
      rating: body.rating || null,
      substring: body.substring || null,
      userid: body.userid || null,
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
        $eq: q.rating.condition === '=' ? q.rating.value : undefined,
        $gt: q.rating.condition === '>' ? q.rating.value : undefined,
        $lt: q.rating.condition === '<' ? q.rating.value : undefined,
      };
    }
    if (q.substring) {
      where.$or = [
        { text: { $regexp: q.substring } },
        { email: { $regexp: q.substring } },
        { name: { $regexp: q.substring } },
      ];
    }

    return db.feedback
      .findAll({
        limit: QUERY_ROW_LIMIT,
        order: q.order
          ? [[q.order.column, q.order.ascending ? 'ASC' : 'DESC']]
          : undefined,
        where,
      })
      .then((results: FeedbackInstance[]) => {
        return Promise.all(
          results.map((r: FeedbackInstance) => {
            return getQuest(db, r.get('partition'), r.get('questid')).then(
              (quest: Quest) => {
                return {
                  partition: r.get('partition'),
                  quest: {
                    id: r.get('questid'),
                    title: quest.title,
                  },
                  rating: r.get('rating'),
                  suppressed: r.get('tombstone') !== null,
                  text: r.get('text'),
                  user: {
                    email: r.get('email'),
                    id: r.get('userid'),
                  },
                } as QT.FeedbackEntry;
              },
            );
          }),
        );
      })
      .then((results: Array<QT.FeedbackEntry | null>) => {
        return results.filter((r: QT.FeedbackEntry | null) => {
          return r !== null;
        });
      })
      .then((results: QT.FeedbackEntry[]) => {
        res.status(200).send(JSON.stringify(results));
      })
      .catch(handleErrors(res));
  } catch (e) {
    handleErrors(res)(e);
  }
}

export function modifyFeedback(
  db: Database,
  req: express.Request,
  res: express.Response,
) {
  try {
    let body: any;
    body = JSON.parse(req.body);

    const m: QT.FeedbackMutation = {
      partition: body.partition || null,
      questid: body.questid || null,
      suppress: body.suppress,
      userid: body.userid || null,
    };

    if (m.suppress !== null) {
      return suppressFeedback(
        db,
        m.partition,
        m.questid,
        m.userid,
        m.suppress || false,
      )
        .then(() => {
          res.status(200).send(JSON.stringify({ status: 'OK' } as QT.Response));
        })
        .catch(handleErrors(res));
    }
  } catch (e) {
    handleErrors(res)(e);
  }
}

export function queryQuest(
  db: Database,
  req: express.Request,
  res: express.Response,
) {
  try {
    let body: any;
    body = validateOrder(JSON.parse(req.body));

    const q: QT.QuestQuery = {
      order: body.order || null,
      questid: body.questid || null,
      substring: body.substring || null,
      userid: body.userid || null,
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
        { title: { $regexp: q.substring } },
        { summary: { $regexp: q.substring } },
      ];
    }

    return db.quests
      .findAll({
        limit: QUERY_ROW_LIMIT,
        order: q.order
          ? [[q.order.column, q.order.ascending ? 'ASC' : 'DESC']]
          : undefined,
        where,
      })
      .then((results: QuestInstance[]) => {
        return results.map((r: QuestInstance) => {
          return {
            id: r.get('id'),
            partition: r.get('partition'),
            published: !r.get('tombstone') && r.get('published') !== null,
            ratingavg: r.get('ratingavg'),
            ratingcount: r.get('ratingcount'),
            title: r.get('title'),
            user: {
              email: r.get('email'),
              id: r.get('userid'),
            },
          } as QT.QuestEntry;
        });
      })
      .then((results: QT.QuestEntry[]) => {
        res.status(200).send(JSON.stringify(results));
      })
      .catch(handleErrors(res));
  } catch (e) {
    handleErrors(res)(e);
  }
}

export function modifyQuest(
  db: Database,
  req: express.Request,
  res: express.Response,
) {
  try {
    let body: any;
    body = JSON.parse(req.body);

    const m: QT.QuestMutation = {
      partition: body.partition || null,
      published: body.published !== undefined ? body.published : null,
      questid: body.questid || null,
    };

    if (m.published === true) {
      return republishQuest(db, m.partition, m.questid)
        .then(() => {
          res.status(200).send(JSON.stringify({ status: 'OK' } as QT.Response));
        })
        .catch(handleErrors(res));
    } else if (m.published === false) {
      return unpublishQuest(db, m.partition, m.questid)
        .then(() => {
          res.status(200).send(JSON.stringify({ status: 'OK' } as QT.Response));
        })
        .catch(handleErrors(res));
    }
    throw Error('invalid modifier');
  } catch (e) {
    handleErrors(res)(e);
  }
}

export function queryUser(
  db: Database,
  req: express.Request,
  res: express.Response,
) {
  try {
    let body: any;
    body = validateOrder(JSON.parse(req.body));
    const q: QT.UserQuery = {
      order: body.order || null,
      substring: body.substring || null,
      userid: body.userid || null,
    };

    const where: any = {};
    if (q.userid) {
      where.userid = q.userid;
    }
    if (q.substring) {
      where.$or = [
        { email: { $regexp: q.substring } },
        { name: { $regexp: q.substring } },
      ];
    }

    return db.users
      .findAll({
        limit: QUERY_ROW_LIMIT,
        order: q.order
          ? [[q.order.column, q.order.ascending ? 'ASC' : 'DESC']]
          : undefined,
        where,
      })
      .then((results: UserInstance[]) => {
        return results.map((r: UserInstance) => {
          return {
            email: r.get('email'),
            id: r.get('id'),
            last_login: r.get('lastLogin'),
            loot_points: r.get('lootPoints'),
            name: r.get('name'),
          } as QT.UserEntry;
        });
      })
      .then((results: QT.UserEntry[]) => {
        res.status(200).send(JSON.stringify(results));
      })
      .catch(handleErrors(res));
  } catch (e) {
    handleErrors(res)(e);
  }
}

export function modifyUser(
  db: Database,
  req: express.Request,
  res: express.Response,
) {
  try {
    let body: any;
    body = JSON.parse(req.body);

    const m: QT.UserMutation = {
      loot_points: body.loot_points || null,
      userid: body.userid || null,
    };

    if (m.loot_points) {
      return setLootPoints(db, m.userid, m.loot_points)
        .then(() => {
          res.status(200).send(JSON.stringify({ status: 'OK' } as QT.Response));
        })
        .catch(handleErrors(res));
    }
  } catch (e) {
    handleErrors(res)(e);
  }
}

export function recalculateRatings(
  db: Database,
  req: express.Request,
  res: express.Response,
) {
  return db.quests
    .findAll()
    .then((qs: QuestInstance[]) => {
      const updates: Array<Bluebird<any>> = [];
      for (const q of qs) {
        updates.push(updateQuestRatings(db, q.get('partition'), q.get('id')));
      }
      return Promise.all(updates);
    })
    .then(() => {
      res.status(200).end('All quest ratings updated');
    });
}

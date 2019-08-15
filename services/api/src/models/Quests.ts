import * as Bluebird from 'bluebird';
import Sequelize, { OrderItem, WhereOptions } from 'sequelize';
import { enumValues, Expansion, Partition } from 'shared/schema/Constants';
import { Quest } from 'shared/schema/Quests';
import { RenderedQuest } from 'shared/schema/RenderedQuests';
import { User } from 'shared/schema/Users';
import { MailService } from '../Mail';
import { Database, FeedbackInstance, QuestInstance } from './Database';
import { getFeedbackByQuestId } from './Feedback';
import { prepare } from './Schema';
import { getUser } from './Users';

const { Op } = Sequelize;

const Moment = require('moment');

export const MAX_SEARCH_LIMIT = 100;

export interface QuestSearchParams {
  age?: number | null;
  contentrating?: string | null;
  expansions?: string[] | null;
  genre?: string | null;
  id?: string | null;
  language?: string | null;
  limit?: number | null;
  maxtimeminutes?: number | null;
  mintimeminutes?: number | null;
  order?: string | null;
  owner?: string | null;
  partition?: string | null;
  players?: number | null;
  requirespenpaper?: boolean | null;
  text?: string | null;
  showPrivate?: boolean | null;
}

export function getQuest(
  db: Database,
  partition: string,
  id: string,
): Bluebird<Quest> {
  return db.quests
    .findOne({ where: { partition, id } })
    .then(
      (result: QuestInstance | null) =>
        new Quest(result ? result.dataValues : {}),
    );
}

export function searchQuests(
  db: Database,
  userId: string,
  params: QuestSearchParams,
): Bluebird<QuestInstance[]> {
  // TODO: Validate search params
  const where: WhereOptions = {
    published: { [Op.ne]: null } as any,
    tombstone: null,
    [Op.and]: [], // Use this for multiple OR clauses
  };
  const order: OrderItem[] = [];

  if (params.showPrivate === true) {
    (where as any)[Op.and].push({
      [Op.or]: [
        { partition: Partition.expeditionPublic },
        { partition: Partition.expeditionPrivate, userid: userId },
      ],
    });
    order.push(['partition', 'ASC']); // PRIVATE, then PUBLIC
  } else {
    where.partition = params.partition || Partition.expeditionPublic;
  }

  if (params.id) {
    where.id = params.id;
  }

  // Require results to be published if we're not querying our own quests
  if (params.owner) {
    where.userid = params.owner;
    where.published = { [Op.ne]: null };
  }

  if (params.players) {
    where.minplayers = { [Op.lte]: params.players };
    where.maxplayers = { [Op.gte]: params.players };
  }

  if (params.text && params.text !== '') {
    const text = '%' + params.text.toLowerCase() + '%';
    (where as any)[Op.and].push({
      [Op.or]: [
        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('title')), {
          [Op.like]: text,
        }),
        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('author')), {
          [Op.like]: text,
        }),
      ],
    });
  }

  if (params.age) {
    where.published = {
      [Op.gt]: Moment()
        .subtract(params.age, 'seconds')
        .format('YYYY-MM-DD HH:mm:ss'),
    };
  }

  if (params.mintimeminutes) {
    where.mintimeminutes = { [Op.gte]: params.mintimeminutes };
  }

  if (params.maxtimeminutes) {
    where.maxtimeminutes = { [Op.lte]: params.maxtimeminutes };
  }

  if (params.contentrating) {
    where.contentrating = params.contentrating;
  }

  if (params.genre) {
    where.genre = params.genre;
  }

  if (params.language) {
    where.language = params.language;
  }

  if (params.requirespenpaper) {
    where.requirespenpaper = params.requirespenpaper;
  }

  if (params.order) {
    if (params.order === '+ratingavg') {
      // Default sort - also show very new & unrated quests on top
      order.push(
        Sequelize.literal(
          `(created >= '${Moment()
            .subtract(7, 'day')
            .format('YYYY-MM-DD HH:mm:ss')}' AND ratingcount < 5) DESC`,
        ),
      );
      // NULL values are ordered first by default - for ordering by rating,
      // this is the opposite of what we want.
      // "ORDER BY rating IS NULL" is a sqlite and postgres compatible
      // way to order non-null items first, then null items.
      order.push(Sequelize.literal('ratingavg IS NULL'));
      order.push(['ratingavg', 'DESC']);
      order.push(Sequelize.literal('ratingcount IS NULL'));
      order.push(['ratingcount', 'DESC']);
    } else {
      order.push([
        params.order.substr(1),
        params.order[0] === '+' ? 'ASC' : 'DESC',
      ]);
    }
  }

  // Hide expansion if searching & not specified, otherwise prioritize results
  // that have the expansion as a secondary sort
  if (!params.id) {
    const missingExpansions = enumValues(Expansion).filter(
      (e: Expansion) =>
        (params.expansions || []).indexOf(e) === -1 && e !== 'base',
    );
    for (const m of missingExpansions) {
      where['expansion' + m] = { [Op.not]: true };
    }
    // Order by the weight of compatible expansions
    const orderStr = enumValues(Expansion)
      .filter((e: Expansion) => e !== 'base')
      .map(e => `(CASE WHEN expansion${e} THEN 1 ELSE 0 END)`)
      .reduce((a, b) => `${a} + ${b}`);
    order.push([Sequelize.literal(orderStr), 'DESC']);
  }

  const limit = Math.min(
    Math.max(params.limit || MAX_SEARCH_LIMIT, 0),
    MAX_SEARCH_LIMIT,
  );

  return db.quests.findAll({ where, order, limit });
}

function mailNewQuestToAdmin(mail: MailService, quest: Quest) {
  // If this is a newly published quest, email us!
  // We don't care if this fails.
  const to = ['team+newquest@fabricate.io'];
  const subject = `Please review! New quest published: ${quest.title} (${
    quest.partition
  }, ${quest.language})`;
  const message = `Summary: ${quest.summary}.\n
    By ${quest.author} (${quest.email}),
    for ${quest.minplayers} - ${quest.maxplayers} players
    over ${quest.mintimeminutes} - ${quest.maxtimeminutes} minutes.
    ${quest.genre}.
    ${
      quest.requirespenpaper
        ? 'Requires pen and paper.'
        : 'No pen or paper required.'
    }
    Horror: ${quest.expansionhorror ? 'Required' : 'no'}.
    Future: ${quest.expansionfuture ? 'Required' : 'no'}.
    Scarred Lands: ${quest.expansionscarredlands ? 'Required' : 'no'}.
    Of Wyrms & Giants: ${quest.expansionwyrmsgiants ? 'Required' : 'no'}.`;
  return mail.send(to, subject, message);
}

function mailFirstQuestPublish(mail: MailService, quest: Quest) {
  const to = ['expedition+newquest@fabricate.io'];
  if (quest.email) {
    to.push(quest.email);
  }
  const subject = 'Congratulations on publishing your first quest!';
  const message = `<p>${quest.author},</p>
    <p>Congratulations on publishing your first Expedition quest!</p>
    <p>For all of the adventurers across the world, thank you for sharing your story with us - we can't wait to play it!</p>
    <p>And remember, if you have any questions or run into any issues, please don't hesistate to email <a href="mailto:Authors@Fabricate.io"/>Authors@Fabricate.io</a></p>
    <p>Sincerely,</p>
    <p>Todd, Scott & The Expedition Team</p>`;
  mail.send(to, subject, message);
}

export function publishQuest(
  db: Database,
  mail: MailService,
  userid: string,
  majorRelease: boolean,
  quest: Quest,
  xml: string,
): Bluebird<QuestInstance> {
  // TODO: Validate XML via crawler
  if (!userid) {
    return Bluebird.reject(new Error('Could not publish - no user id.'));
  }
  if (!xml) {
    return Bluebird.reject(new Error('Could not publish - no xml data.'));
  }

  let instance: QuestInstance;
  let isNew: boolean = false;
  return db.quests
    .findOne({ where: { id: quest.id, partition: quest.partition } })
    .then((i: QuestInstance | null) => {
      isNew = !Boolean(i);
      instance = i || db.quests.build(prepare(quest));

      if (isNew && quest.partition === Partition.expeditionPublic) {
        mailNewQuestToAdmin(mail, quest);

        // New publish on public = 100 loot point award
        getUser(db, userid).then((u: User) => {
          u.lootPoints = (u.lootPoints || 0) + 100;
          db.users.upsert(prepare(u));
        });

        // If this is the author's first published quest, email them a congratulations
        db.quests.findOne({ where: { userid } }).then((qi: QuestInstance) => {
          if (!Boolean(qi)) {
            mailFirstQuestPublish(mail, quest);
          }
        });
      }

      const updateValues: Partial<Quest> = {
        ...quest.withoutDefaults(),
        published: new Date(),
        publishedurl: `http://quests.expeditiongame.com/raw/${
          quest.partition
        }/${quest.id}/${quest.questversion}`,
        questversion:
          (instance.get('questversion') || quest.questversion || 0) + 1,
        tombstone: null as any, // Remove tombstone; need null instead of undefined to trigger Sequelize update override
        userid, // Not included in the request - pull from auth
      };
      if (majorRelease) {
        updateValues.questversionlastmajor = updateValues.questversion;
        updateValues.created = new Date();
        updateValues.ratingavg = 0;
        updateValues.ratingcount = 0;
      }

      // Publish to RenderedQuests (async)
      db.renderedQuests.create(
        new RenderedQuest({
          id: quest.id,
          partition: quest.partition,
          questversion: updateValues.questversion,
          xml,
        }),
      );

      return instance.update(updateValues);
    });
}

export function unpublishQuest(db: Database, partition: string, id: string) {
  return db.quests.update(
    { tombstone: new Date() },
    { where: { partition, id }, limit: 1 },
  );
}

export function republishQuest(db: Database, partition: string, id: string) {
  return db.quests.update({ tombstone: null } as any, {
    where: { partition, id },
    limit: 1,
  });
}

export function updateQuestRatings(
  db: Database,
  partition: string,
  id: string,
): Bluebird<QuestInstance> {
  let quest: QuestInstance;
  return db.quests
    .findOne({ where: { partition, id } })
    .then((q: QuestInstance) => {
      quest = q;
      return getFeedbackByQuestId(db, partition, quest.get('id'));
    })
    .then((feedback: FeedbackInstance[]) => {
      const ratings: number[] = feedback
        .filter((f: FeedbackInstance) => {
          if (f.get('tombstone')) {
            return false;
          }
          if (!quest.get('questversionlastmajor')) {
            return true;
          }
          if (!f.get('questversion') || !f.get('rating')) {
            return false;
          }
          return f.get('questversion') >= quest.get('questversionlastmajor');
        })
        .map((f: FeedbackInstance) => {
          if (
            f.get('rating') === undefined ||
            f.get('rating') === null ||
            f.get('rating') === 0
          ) {
            // typescript isn't quite smart enough to realize we already filtered
            // out any null/zero ratings. We add this here to appease it.
            throw Error('Failed to filter out null ratings');
          }
          return f.get('rating');
        });
      const ratingcount = ratings.length;
      if (ratingcount === 0) {
        return quest.update({ ratingcount: null, ratingavg: null });
      }

      const ratingavg =
        ratings.reduce((a: number, b: number) => a + b) / ratings.length;
      return quest.update({ ratingcount, ratingavg });
    });
}

import * as Bluebird from 'bluebird';
import Sequelize, {Op} from 'sequelize';
import {PUBLIC_PARTITION} from 'shared/schema/Constants';
import {Quest} from 'shared/schema/Quests';
import {User} from 'shared/schema/Users';
import Config from '../config';
import {Database, QuestInstance} from './Database';

export function setLootPoints(db: Database, id: string, lootPoints: number) {
  return db.users.findOne({where: {id}})
  .then((result) => {
    if (result === null) {
      throw new Error('No user with ID ' + id);
    }
    result.update({lootPoints});
  });
}

export function incrementLoginCount(db: Database, id: string) {
  return db.users.update({
    loginCount: Sequelize.literal('login_count + 1') as any,
    lastLogin: Sequelize.literal('CURRENT_TIMESTAMP') as any,
  }, { where: {id}});
}

export function getUser(db: Database, id: string): Bluebird<User> {
  return db.users.findOne({where: {id}})
  .then((result) =>  new User((result) ? result.dataValues : {}));
}

export function maybeGetUserByEmail(db: Database, email: string): Bluebird<User|null> {
  return db.users.findOne({where: {email}})
  .then((result) => (result) ? new User(result.dataValues) : null);
}

export function subscribeToCreatorsList(mc: any, email: string) {
  if (email === '') {
    return null;
  }

  return mc.post('/lists/' + Config.get('MAILCHIMP_CREATORS_LIST_ID') + '/members/', {
    email_address: email,
    status: 'subscribed',
  })
  .then((result: any) => {
    console.log(email + ' subscribed to creators list, result: ' + result);
  });
}

interface IUserQuestType {
  details: Quest;
  lastPlayed: Date;
}

export interface UserQuestsType {
  [questId: string]: IUserQuestType;
}
// Added this questId to filter the user posts on the basis of quests on which user had given the feedback.
export function getUserQuests(db: Database, id: string, questIds?: string[]): Bluebird<UserQuestsType> {
  const where = {userID: id, category: 'quest', action: 'end', questID: { [Op.notIn]: [] as string[] }};
  if (questIds) {
    where.questID = { [Op.in]: questIds };
  }
  return db.analyticsEvent.findAll({
    where,
    attributes: ['questID', [Sequelize.fn('MAX', Sequelize.col('created')), 'lastPlayed']],
    group: 'questID',
  })
  .then((results: any[]) => {
    const userQuests = {} as UserQuestsType;
    (results || []).forEach((result: any) => {
      const questId = result.get('questID');
      userQuests[questId] = {
        ...userQuests[questId],
        lastPlayed: new Date(result.get('lastPlayed')),
      };
    });

    const metas: Array<Bluebird<void>> = [];
    for (const k of Object.keys(userQuests)) {
      metas.push(db.quests.findOne({
        where: {partition: PUBLIC_PARTITION, id: k},
        limit: 1,
      })
      .then((q: QuestInstance|null) => {
        if (q === null) {
          delete userQuests[k];
          return;
        }
        const qq = Quest.create(q.dataValues);
        if (qq instanceof Error) {
          delete userQuests[k];
          return;
        }
        userQuests[k].details = qq;
      }));
    }

    return Bluebird.all(metas).then(() => userQuests);
  });
}

export interface IUserFeedback {
  rating: number;
  text: string;
  quest: IUserQuestType;
}

export function getUserFeedbacks(db: Database, userid: string): Bluebird<IUserFeedback[]> {
  return db.feedback.findAll({
    where: { userid, anonymous: false },
    attributes: ['rating', 'questid', 'text', 'questversion'],
    order: [['created', 'DESC']],
  }).then((feedbacks) => {
    const questIds = feedbacks.map(({ questid }: any) => questid);
    return getUserQuests(db, userid, questIds)
    .then((quests) => {
      return feedbacks.map((feedback) => ({
          rating: feedback.get('rating'),
          text: feedback.get('text'),
          quest: quests[feedback.get('questid')],
      }));
    });
  });
}

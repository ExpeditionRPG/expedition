import * as Bluebird from 'bluebird';
import Sequelize from 'sequelize';
import {PUBLIC_PARTITION} from 'shared/schema/Constants';
import {User} from 'shared/schema/Users';
import {Quest} from 'shared/schema/Quests';
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
  return db.users.findOne({where: {id}})
  .then((result) => {
    if (result === null) {
      throw new Error('No user with ID ' + id);
    }
    result.increment('loginCount');
  });
}

export function getUser(db: Database, id: string): Bluebird<User> {
  return db.users.findOne({where: {id}})
  .then((result) =>  new User((result) ? result.dataValues : {}));
}

export function subscribeToCreatorsList(mc: any, email: string) {
  return mc.post('/lists/' + Config.get('MAILCHIMP_CREATORS_LIST_ID') + '/members/', {
    email_address: email,
    status: 'subscribed',
  });
}

export interface UserQuestsType {
  [questId: string]: {
    details: Quest;
    lastPlayed: Date;
  };
}

export function getUserQuests(db: Database, id: string): Bluebird<UserQuestsType> {
  return db.analyticsEvent.findAll({
    attributes: ['questID', [Sequelize.fn('MAX', Sequelize.col('created')), 'lastPlayed']],
    group: 'questID',
    where: {userID: id, category: 'quest', action: 'end'},
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

    const metas: Bluebird<void>[] = [];
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

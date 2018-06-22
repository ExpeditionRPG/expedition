import Config from '../config'
import Sequelize from 'sequelize'
import * as Bluebird from 'bluebird'
import {Database} from './Database'
import {User} from '@expedition-qdl/schema/Users'

export function setLootPoints(db: Database, id: string, lootPoints: number) {
  return db.users.findOne({where: {id}})
    .then((result) => {
      if (result === null) {
        throw new Error('No user with ID ' + id);
      }
      result.update({lootPoints})
    });
}

export function incrementLoginCount(db: Database, id: string) {
  return db.users.findOne({where: {id: id}})
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
    lastPlayed: Date;
  };
};

export function getUserQuests(db: Database, id: string): Bluebird<UserQuestsType> {
  return db.analyticsEvent.findAll({
      attributes: ['questID', [Sequelize.fn('MAX', Sequelize.col('created')), 'lastPlayed']],
      where: {userID: id, category: 'quest', action: 'end'},
      group: 'questID',
    })
  .then((results: any[]) => {
    const userQuests = {} as UserQuestsType;
    (results || []).forEach((result: any) => {
      const id = result.get('questID');
      userQuests[id] = {
        ...userQuests[id],
        lastPlayed: new Date(result.get('lastPlayed')),
      };
    });
    return userQuests;
  });
}

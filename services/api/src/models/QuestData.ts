import * as Bluebird from 'bluebird';
import {QuestData} from 'shared/schema/QuestData';
import {Database, QuestDataInstance} from './Database';

export function getNewestQuestData(db: Database, id: string, userid: string): Bluebird<QuestData> {
  return db.questData.findOne({where: {id, userid}})
    .then((result: QuestDataInstance|null) => {
      return new QuestData((result) ? result.dataValues : {});
    });
}

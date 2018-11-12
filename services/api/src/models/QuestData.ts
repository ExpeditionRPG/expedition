import * as Bluebird from 'bluebird';
import {QuestData} from 'shared/schema/QuestData';
import {Database, QuestDataInstance} from './Database';
import {prepare} from './Schema';

export function saveQuestData(db: Database, data: QuestData, now: number = Date.now()): Bluebird<any> {
  // Double buffered save (2 rows, saves write the oldest row if both older than 24h, otherwise most recent row)
  return db.questData.create(prepare(data))
    .then(() => {
      return db.questData.findAll({
        where: {id: data.id, userid: data.userid},
        order: [['created', 'DESC']]
      });
    }).then((value: QuestDataInstance[]) => {
      if (value.length <= 2) {
        return;
      }

      const oldest = value[value.length-1];
      const nextNewest = value[1];

      if (new Date(nextNewest.dataValues['created']) < new Date(now - 24*60*60*1000)) {
        // Prev newest older than 24h? remove the oldest row.
        return oldest.destroy();
      } else {
        // Otherwise remove the most recent row.
        return nextNewest.destroy();
      }
    });
}

export function getNewestQuestData(db: Database, id: string, userid: string): Bluebird<QuestData> {
  return db.questData.findOne({where: {id, userid}})
    .then((result: QuestDataInstance|null) => {
      return new QuestData((result) ? result.dataValues : {});
    });
}

import * as Bluebird from 'bluebird';
import {QuestData} from 'shared/schema/QuestData';
import {Database, QuestDataInstance} from './Database';
import {prepare} from './Schema';

export function saveQuestData(db: Database, data: QuestData, now: number = Date.now()): Bluebird<any> {
  // Double buffered save (2 rows, saves write the oldest row if both older than 24h, otherwise most recent row)
  return db.questData.findOne({
    where: {id: data.id, userid: data.userid, tombstone: null},
    order: [['created', 'DESC']],
  }).then((i: QuestDataInstance|null) => {
    if (i && i.dataValues.edittime.getTime() !== data.edittime.getTime()) {
      throw new Error('Edit time mismatch for: got ' + i.dataValues.edittime.getTime() + ', expected ' + data.edittime.getTime());
    }
    return db.questData.create(prepare(data));
  }).then(() => {
    return db.questData.findAll({
      where: {id: data.id, userid: data.userid},
      order: [['created', 'DESC']],
    });
  }).then((value: QuestDataInstance[]) => {
    if (value.length <= 2) {
      return;
    }

    const oldest = value[value.length - 1];
    const nextNewest = value[1];

    if (new Date(nextNewest.dataValues.created) < new Date(now - 24 * 60 * 60 * 1000)) {
      // Prev newest older than 24h? remove the oldest row.
      return oldest.destroy();
    } else {
      // Otherwise remove the most recent row.
      return nextNewest.destroy();
    }
  });

}

export function claimNewestQuestData(db: Database, id: string, userid: string, edittime: Date): Bluebird<QuestData> {
  let result: QuestData;
  return db.questData.findOne({
    where: {id, userid, tombstone: null},
    order: [['created', 'DESC']],
  }).then((i: QuestDataInstance|null) => {
    if (i === null) {
      throw new Error('No quest data found');
    }
    result = new QuestData((i) ? i.dataValues : {});
    result.edittime = edittime;
    return i.update({edittime});
  }).then(() => {
    return result;
  });
}

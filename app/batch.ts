import {QuestInstance, QuestAttributes} from './models/Quests'
import {models} from './models/Database'

const request = require('request');

function doFn(quest: QuestInstance) {
  if (!quest.dataValues.published) {
    console.log(`Skipping "${quest.dataValues.title}" (unpublished)`);
    return;
  }
  if (quest.dataValues.tombstone) {
    console.log(`Skipping "${quest.dataValues.title}" (tombstoned)`);
    return;
  }
  // Fetch XML
  request(quest.dataValues.publishedurl, {}, (err: Error, res: any, body: any) => {
    console.log(`${quest.dataValues.partition}: ${quest.dataValues.title} (${quest.dataValues.id})`);
    if (!body.startsWith('<quest')) {
      return console.error(`${quest.dataValues.id}: "${quest.dataValues.title}" points to invalid XML: ${body}`);
    }

    // TODO: Your Code Here
    console.log(body.substr(0, 50) + '...');
  });
}

function main() {
  // TODO Multithread
  models.Quest.model.findAll().then((quests: QuestInstance[]) => {
      console.log('Running job over ' + quests.length + ' quests');
      quests.map((q: QuestInstance) => {
        doFn(q);
      });
    });
}

main();

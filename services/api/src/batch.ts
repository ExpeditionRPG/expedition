import { Sequelize } from 'sequelize';
import Config from './config';
import { Database, QuestInstance } from './models/Database';

const request = require('request');

function doFn(quest: QuestInstance) {
  if (!quest.get('published')) {
    console.log(`Skipping "${quest.get('title')}" (unpublished)`);
    return;
  }
  if (quest.get('tombstone')) {
    console.log(`Skipping "${quest.get('title')}" (tombstoned)`);
    return;
  }
  // Fetch XML
  request(quest.get('publishedurl'), {}, (err: Error, res: any, body: any) => {
    console.log(
      `${quest.get('partition')}: ${quest.get('title')} (${quest.get('id')})`
    );
    if (!body.startsWith('<quest')) {
      return console.error(
        `${quest.get('id')}: "${quest.get(
          'title'
        )}" points to invalid XML: ${body}`
      );
    }

    // TODO: Your Code Here
    console.log(body.substr(0, 50) + '...');
  });
}

function main() {
  const db = new Database(
    new Sequelize(Config.get('DATABASE_URL'), {
      dialectOptions: {
        ssl: true,
      },
      logging: Config.get('SEQUELIZE_LOGGING') === 'true',
    })
  );

  db.quests.findAll().then((quests: QuestInstance[]) => {
    console.log('Running job over ' + quests.length + ' quests');
    quests.map((q: QuestInstance) => {
      doFn(q);
    });
  });
}

main();

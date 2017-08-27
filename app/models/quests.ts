import * as Sequelize from 'sequelize'
import {Feedback, FeedbackInstance} from './feedback'

import * as CloudStorage from '../lib/cloudstorage'
import * as Mail from '../mail'
import * as Promise from 'bluebird';

export interface QuestAttributes {
  partition?: string;
  id?: string;
  questversion?: number;
  questversionlastmajor?: number;
  engineversion?: string;
  publishedurl?: string;
  userid?: string;
  author?: string;
  email?: string;
  maxplayers?: number;
  maxtimeminutes?: number;
  minplayers?: number;
  mintimeminutes?: number;
  summary?: string;
  title?: string;
  url?: string;
  familyfriendly?: boolean;
  ratingavg?: number;
  ratingcount?: number;
  genre?: string;
  contentrating?: string;
  created?: Date;
  published?: Date;
  tombstone?: Date;
}

export interface QuestInstance extends Sequelize.Instance<QuestAttributes> {
  dataValues: QuestAttributes;
}

export type QuestModel = Sequelize.Model<QuestInstance, QuestAttributes>;

export class Quest {
  private s: Sequelize.Sequelize;
  private mc: any;
  private feedback: Feedback;
  public model: QuestModel;

  constructor(s: Sequelize.Sequelize) {
    this.s = s;
    this.model = this.s.define<QuestInstance, QuestAttributes>('quests', {
      partition: {
        type: Sequelize.STRING,
        validate: {
          max: 32,
        },
        allowNull: false,
        primaryKey: true,
      },
      id: {
        type: Sequelize.STRING,
        validate: {
          max: 255,
        },
        allowNull: false,
        primaryKey: true,
      },
      questversion: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      questversionlastmajor: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      engineversion: {
        type: Sequelize.STRING,
        validate: {
          max: 128,
        },
      },
      publishedurl: {
        type: Sequelize.STRING,
        validate: {
          max: 2048,
        },
      },
      userid: {
        type: Sequelize.STRING,
        validate: {
          max: 255,
        },
      },
      author: {
        type: Sequelize.STRING,
        validate: {
          max: 255,
        },
      },
      email: {
        type: Sequelize.STRING,
        validate: {
          max: 255,
        },
      },
      maxplayers: Sequelize.INTEGER,
      maxtimeminutes: Sequelize.INTEGER,
      minplayers: Sequelize.INTEGER,
      mintimeminutes: Sequelize.INTEGER,
      summary: {
        type: Sequelize.STRING,
        validate: {
          max: 1024,
        },
      },
      title: {
        type: Sequelize.STRING,
        validate: {
          max: 255,
        },
      },
      url: {
        type: Sequelize.STRING,
        validate: {
          max: 2048,
        },
      },
      familyfriendly: Sequelize.BOOLEAN,
      ratingavg: Sequelize.DECIMAL(4, 2),
      ratingcount: Sequelize.INTEGER,
      genre: {
        type: Sequelize.STRING,
        validate: {
          max: 128,
        },
      },
      contentrating: {
        type: Sequelize.STRING,
        validate: {
          max: 128,
        },
      },
      created: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      published: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      tombstone: Sequelize.DATE,
    }, {
      timestamps: false, // TODO: eventually switch to sequelize timestamps
      underscored: true,
    });
  }

  associate(models: {Feedback: Feedback}) {
    this.feedback = models.Feedback;
  }

  get(partition: string, id: string): Promise<QuestInstance> {
    return this.s.authenticate()
      .then(() => {return this.model.findOne({where: [{partition, id}]})});
  }

  // TODO: SearchParams interface
  search(partition: string, userId: string, params: any): Promise<QuestInstance[]> {
    // TODO: Validate search params
    const where: Sequelize.WhereOptions<QuestAttributes> = {partition, tombstone: null};

    if (params.id) {
      where.id = params.id;
    }

    // Require results to be published if we're not querying our own quests
    if (params.owner !== userId || userId === '') {
      where.published = {$ne: null};
    }

    if (params.players) {
      where.minplayers = {$lt: params.players};
      where.maxplayers = {$gt: params.players};
    }

    // DEPRECATED from app 6/10/17 (also in schemas.js)
    (where as Sequelize.AnyWhereOptions).$and = [];
    if (params.search) {
      const search = '%' + params.search.toLowerCase() + '%';
      (where as any).$and.push(Sequelize.where(Sequelize.fn('LOWER', 'title'), {$like: search}));
    }

    if (params.text && params.text !== '') {
      const text = '%' + params.text.toLowerCase() + '%';
      (where as any).$and.push(Sequelize.where(Sequelize.fn('LOWER', 'title'), {$like: text}));
    }

    if (params.age) {
      where.published = {$gt: Date.now() - params.age};
    }

    if (params.mintimeminutes) {
      where.mintimeminutes = {$gte: params.mintimeminutes};
    }

    if (params.maxtimeminutes) {
      where.maxtimeminutes = {$lte: params.maxtimeminutes};
    }

    if (params.contentrating) {
      where.contentrating = params.contentrating;
    }

    if (params.genre) {
      where.genre = params.genre;
    }

    const order = [];
    if (params.order) {
      if (params.order === '+ratingavg') {
        order.push(Sequelize.literal(`
          CASE
            WHEN ratingcount < 5 THEN 0
            ELSE ratingavg
          END DESC NULLS LAST`));
      } else {
        order.push([params.order.substr(1), (params.order[0] === '+') ? 'ASC' : 'DESC']);
      }
    }

    const limit = Math.max(params.limit || 0, 100);

    return this.model.findAll({where, order, limit});
  }

  publish(userid: string, majorRelease: boolean, params: QuestAttributes, xml: string): Promise<QuestInstance> {
    // TODO: Validate XML via crawler
    if (!userid) {
      return Promise.reject(new Error('Could not publish - no user id.'));
    }
    if (!xml) {
      return Promise.reject(new Error('Could not publish - no xml data.'));
    }

    let quest: QuestInstance;
    return this.s.authenticate()
      .then(() => {
        return this.model.findOne({where: {id: params.id}});
      })
      .spread((q: QuestInstance, created: boolean) => {
        quest = q;
        if (created) {
          // if this is a newly published quest, email us!
          const message = `Summary: ${params.summary}. By ${params.author}, for ${params.minplayers} - ${params.maxplayers} players.`;
          Mail.send('expedition+newquest@fabricate.io', 'New quest published: ' + params.title, message, (err: Error, result: any) => {});
        }

        quest.dataValues = {...quest.dataValues, params};
        quest.dataValues.questversion = (quest.dataValues.questversion || 0) + 1;

        if (majorRelease) {
          quest.dataValues.questversionlastmajor = quest.dataValues.questversion;
        }

        return quest.validate();
      })
      .then(() => {
        const cloudStorageData = {
          gcsname: userid + '/' + quest.dataValues.id + '/' + Date.now() + '.xml',
          buffer: xml
        };

        // Run the update in parallel with the Datastore model now that we know the update is valid.
        CloudStorage.upload(cloudStorageData, (err: Error) => {
          if (err) {
            console.log(err);
          }
        });
        quest.dataValues.publishedurl = CloudStorage.getPublicUrl(cloudStorageData.gcsname);
        return quest.save();
      });
  };

  unpublish(partition: string, id: string): Promise<QuestInstance> {
    return this.s.authenticate()
      .then(() => {
        return this.model.update({tombstone: new Date()}, {where: {partition, id}})
      });
  }

  updateRatings(partition: string, id: string): Promise<QuestInstance> {
    let quest: QuestInstance;
    return this.s.authenticate()
      .then(() => {
        return this.model.findOne({where: {partition, id}});
      })
      .then((q: QuestInstance) => {
        quest = q;
        return this.feedback.getByQuestId(partition, quest.dataValues.id);
      })
      .then((feedback: FeedbackInstance[]) => {
        const ratings = feedback.filter((f: FeedbackInstance) => {
          return (f.dataValues.questversion >= quest.dataValues.questversionlastmajor);
        }).map((f: FeedbackInstance) => {
          return f.dataValues.rating;
        });
        const ratingcount = ratings.length;
        const ratingavg = ratings.reduce((a: number, b: number) => { return a + b; }) / ratings.length;
        return quest.update({ratingcount, ratingavg});
      });
  }
}

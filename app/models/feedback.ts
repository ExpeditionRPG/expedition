import * as Mail from '../mail'
import {Quest, QuestInstance} from './quests'
import * as Sequelize from 'sequelize'
import * as Promise from 'bluebird';

export interface FeedbackAttributes {
  partition?: string;
  questid?: string;
  userid?: string;
  questversion?: number;
  created?: Date;
  rating?: number;
  text?: string;
  email?: string;
  name?: string;
  difficulty?: string;
  platform?: string;
  players?: number;
  version?: string;
}

export interface FeedbackInstance extends Sequelize.Instance<FeedbackAttributes> {
  dataValues: FeedbackAttributes;
}

export type FeedbackModel = Sequelize.Model<FeedbackInstance, FeedbackAttributes>;

export class Feedback {
  private s: Sequelize.Sequelize;
  private mail: any;
  public model: FeedbackModel;
  private quest: Quest;

  constructor(s: Sequelize.Sequelize) {
    this.s = s;
    this.model = this.s.define<FeedbackInstance, FeedbackAttributes>('feedback', {
      partition: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        validate: {
          max: 32,
        }
      },
      questid: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        validate: {
          max: 255,
        },
      },
      userid: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        validate: {
          max: 255,
        },
      },
      questversion: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      created: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      rating: Sequelize.INTEGER,
      text: {
        type: Sequelize.STRING,
        validate: {
          max: 2048,
        },
      },
      email: {
        type: Sequelize.STRING,
        validate: {
          isEmail: true,
        },
      },
      name: {
        type: Sequelize.STRING,
        validate: {
          max: 255,
        },
      },
      difficulty: {
        type: Sequelize.STRING,
        validate: {
          max: 32,
        },
      },
      platform: {
        type: Sequelize.STRING,
        validate: {
          max: 32,
        },
      },
      players: Sequelize.INTEGER,
      version: {
        type: Sequelize.STRING,
        validate: {
          max: 32,
        },
      },
    }, {
      freezeTableName: true,
      timestamps: false, // TODO: eventually switch to sequelize timestamps
      underscored: true,
    });
  }

  public associate(models: {Quest: Quest}) {
    this.quest = models.Quest;
  }

  public get(partition: string, questid: string, userid: string): Promise<FeedbackInstance> {
    return this.s.authenticate()
      .then(() => {
        return this.model.findOne({where: {partition, questid, userid}});
      });
  }

  public getByQuestId(partition: string, questid: string): Promise<FeedbackInstance[]> {
    return this.s.authenticate()
      .then(() => {
        return this.model.findAll({where: {partition, questid, rating: {$ne: null}}});
      });
  };

  public submit(type: 'rating'|'report', feedback: FeedbackAttributes): Promise<any> {
    // Get quest version, then upsert feedback with the version of the quest.
    // Recalculate ratings on the quest
    // Then send a mail.

    let quest: QuestInstance;
    return this.s.authenticate()
      .then(() => {
        return this.quest.get(feedback.partition, feedback.questid);
      })
      .then((q: QuestInstance) => {
        if (!q) {
          throw new Error("No such quest with id " + feedback.questid);
        }

        feedback.questversion = q.dataValues.questversion;
        return this.model.upsert(feedback);
      })
      .then((created: Boolean) => {
        return this.quest.updateRatings(feedback.partition, feedback.questid);
      })
      .then((q: QuestInstance) => {
        quest = q;
        if (!this.mail) {
          return Promise.resolve();
        }

        const ratingavg = (quest.dataValues.ratingavg || 0).toFixed(1);
        const message = `<p>User feedback:</p>
          <p>"${feedback.text}"</p>
          <p>${feedback.rating} out of 5 stars</p>
          <p>New quest overall rating: ${ratingavg} out of 5 across ${quest.dataValues.ratingcount} ratings.</p>
          <p>Was submitted for ${quest.dataValues.title} by ${quest.dataValues.author}</p>
          <p>They played with ${feedback.players} adventurers on ${feedback.difficulty} difficulty on ${feedback.platform} v${feedback.version}.</p>
          <p>User email that reported it: <a href="mailto:${feedback.email}">${feedback.email}</a></p>
          <p>Quest id: ${feedback.questid}</p>
        `;

        if (type === 'rating' && feedback.text.length > 0) {
          const subject = `Quest rated ${feedback.rating}/5: ${quest.dataValues.title}`;
          console.log(subject);
          return Mail.send([quest.dataValues.email, 'expedition+questfeedback@fabricate.io'], subject, message);
        } else if (type === 'report') {
          const subject = `Quest reported: ${quest.dataValues.title}`;
          console.log(subject);
          return Mail.send([quest.dataValues.email, 'expedition+questreported@fabricate.io'], subject, message);
        }
      })
      .then(() => {
        console.log('Feedback sent for quest (' + quest.dataValues.title + ')');
      });
  }
}


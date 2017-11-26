import * as Mail from '../Mail'
import {Quest, QuestInstance} from './Quests'
import * as Sequelize from 'sequelize'
import * as Promise from 'bluebird';

export type FeedbackType = 'rating'|'report';

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
  protected s: Sequelize.Sequelize;
  protected mail: any;
  public model: FeedbackModel;
  protected quest: Quest;

  constructor(s: Sequelize.Sequelize) {
    this.s = s;
    this.model = this.s.define<FeedbackInstance, FeedbackAttributes>('feedback', {
      partition: {
        type: Sequelize.STRING(32),
        allowNull: false,
        primaryKey: true,
      },
      questid: {
        type: Sequelize.STRING(255),
        allowNull: false,
        primaryKey: true,
      },
      userid: {
        type: Sequelize.STRING(255),
        allowNull: false,
        primaryKey: true,
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
      text: Sequelize.STRING(2048),
      email: {
        type: Sequelize.STRING(255),
        validate: {
          isEmail: true,
        },
      },
      name: Sequelize.STRING(255),
      difficulty: Sequelize.STRING(32),
      platform: Sequelize.STRING(32),
      players: Sequelize.INTEGER,
      version: Sequelize.STRING(32),
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

  public submit(type: FeedbackType, feedback: FeedbackAttributes): Promise<any> {
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
          throw new Error('No such quest with id ' + feedback.questid);
        }

        feedback.questversion = q.dataValues.questversion;
        return this.model.upsert(feedback);
      })
      .then((created: Boolean) => {
        return this.quest.updateRatings(feedback.partition, feedback.questid);
      })
      .then((q: QuestInstance) => {
        quest = q;

        const ratingavg = (quest.dataValues.ratingavg || 0).toFixed(1);
        if (type === 'rating' && quest.dataValues.ratingcount === 1) {
          const subject = `Your quest just received its first rating!`;
          let message = `<p>${quest.dataValues.author},</p>
            <p>Your quest, ${quest.dataValues.title}, just received its first rating!</p>
            <p>${feedback.rating} out of 5 stars.</p>
          `;
          if (feedback.text.length > 0) {
            message += `<p>User feedback:</p><p>"${feedback.text}"</p>`;
          }
          message += `<p>Link to edit quest: <a href="https://quests.expeditiongame.com/#${feedback.questid}>https://quests.expeditiongame.com/#${feedback.questid}</a></p>`;
          return Mail.send([quest.dataValues.email, 'expedition+questfeedback@fabricate.io'], subject, message);
        } else if (type === 'rating' && (feedback.text.length > 0 || feedback.rating < 3)) {
          const subject = `Quest rated ${feedback.rating}/5: ${quest.dataValues.title}`;
          const message = `<p>User feedback:</p>
            <p>"${feedback.text}"</p>
            <p>${feedback.rating} out of 5 stars</p>
            <p>New quest overall rating: ${ratingavg} out of 5 across ${quest.dataValues.ratingcount} ratings.</p>
            <p>Was submitted for ${quest.dataValues.title} by ${quest.dataValues.author}</p>
            <p>They played with ${feedback.players} adventurers on ${feedback.difficulty} difficulty on ${feedback.platform} v${feedback.version}.</p>
            <p>Reviewer email: <a href="mailto:${feedback.email}">${feedback.email}</a></p>
            <p>Link to edit quest: <a href="https://quests.expeditiongame.com/#${feedback.questid}>https://quests.expeditiongame.com/#${feedback.questid}</a></p>
          `;
          return Mail.send([quest.dataValues.email, 'expedition+questfeedback@fabricate.io'], subject, message);
        } else if (type === 'report') {
          const subject = `Quest reported: ${quest.dataValues.title}`;
          const message = `<p>User feedback:</p>
            <p>"${feedback.text}"</p>
            <p>${feedback.rating} out of 5 stars</p>
            <p>New quest overall rating: ${ratingavg} out of 5 across ${quest.dataValues.ratingcount} ratings.</p>
            <p>Was submitted for ${quest.dataValues.title} by ${quest.dataValues.author}</p>
            <p>They played with ${feedback.players} adventurers on ${feedback.difficulty} difficulty on ${feedback.platform} v${feedback.version}.</p>
            <p>User email that reported it: <a href="mailto:${feedback.email}">${feedback.email}</a></p>
            <p>Link to edit quest: <a href="https://quests.expeditiongame.com/#${feedback.questid}>https://quests.expeditiongame.com/#${feedback.questid}</a></p>
          `;
          return Mail.send([quest.dataValues.email, 'expedition+questreported@fabricate.io'], subject, message);
        }
      })
      .then(() => {
        console.log('Feedback sent for quest (' + quest.dataValues.title + ')');
      });
  }
}


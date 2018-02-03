import * as Mail from '../Mail'
import {Quest, QuestAttributes, QuestInstance} from './Quests'
import * as Sequelize from 'sequelize'
import * as Promise from 'bluebird';

export type FeedbackType = 'feedback'|'rating'|'report_error'|'report_quest';

export interface FeedbackAttributes {
  partition: string;
  questid: string;
  userid: string;
  questversion?: number|null;
  created?: Date|null;
  rating?: number|null;
  text?: string|null;
  email?: string|null;
  name?: string|null;
  difficulty?: string|null;
  platform?: string|null;
  platformDump?: string|null; // TODO: Remove this from sequelize table attributes
  players?: number|null;
  version?: string|null;
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

  public get(partition: string, questid: string, userid: string): Promise<FeedbackInstance|null> {
    return this.s.authenticate()
      .then(() => {
        return this.model.findOne({where: {partition, questid, userid} as any});
      });
  }

  public getByQuestId(partition: string, questid: string): Promise<FeedbackInstance[]> {
    return this.s.authenticate()
      .then(() => {
        return this.model.findAll({where: {partition, questid, rating: {$ne: null}} as any});
      });
  };

  public submitFeedback(feedback: FeedbackAttributes): Promise<any> {
    // App feedback: Email us
    return this.s.authenticate()
      .then(() => {
        const subject = `App feedback (${feedback.platform} v${feedback.version})`;
        const message = `<p>Message: ${feedback.text}</p>
          <p>They played with ${feedback.players} adventurers on ${feedback.difficulty} difficulty.</p>
          <p>Raw platform string: ${feedback.platformDump}</p>
          <p>User email that reported it: <a href="mailto:${feedback.email}">${feedback.email}</a></p>
          <p>Link to edit quest: <a href="https://quests.expeditiongame.com/#${feedback.questid}">https://quests.expeditiongame.com/#${feedback.questid}</a></p>
        `;
        return Mail.send(['expedition+appfeedback@fabricate.io'], subject, message);
      });
  }

  public submitRating(feedback: FeedbackAttributes): Promise<any> {
    // Quest rating: Get quest, upsert feedback tagged with the current quest version,
    // Recalculate ratings on the quest, then send a mail if it's remarkable.
    return this.s.authenticate()
      .then(() => {
        return this.quest.get(feedback.partition, feedback.questid);
      })
      .then((quest: QuestInstance) => {
        if (!quest) {
          throw new Error('No such quest with id ' + feedback.questid);
        }

        feedback.questversion = quest.get('questversion');
        return this.model.upsert(feedback);
      })
      .then((created: Boolean) => {
        return this.quest.updateRatings(feedback.partition, feedback.questid);
      })
      .then((questInstance: QuestInstance) => {
        const q = this.quest.resolveInstance(questInstance);
        const ratingavg = q.ratingavg.toFixed(1);
        const emails = [];
        if (q.email) {
          emails.push(q.email);
        }
        if (!feedback.rating || feedback.rating <= 3) {
          emails.push('expedition+questfeedback@fabricate.io');
        }
        if (q.ratingcount === 1) {
          const subject = `Your quest just received its first rating!`;
          let message = `<p>${q.author},</p>
            <p>Your quest, ${q.title}, just received its first rating!</p>
            <p>${feedback.rating} out of 5 stars.</p>
          `;
          if (feedback.text && feedback.text.length > 0) {
            message += `<p>User feedback:</p><p>"${feedback.text}"</p>`;
          }
          message += `<p>Reviewer email: <a href="mailto:${feedback.email}">${feedback.email}</a></p>
            <p>Link to edit quest: <a href="https://quests.expeditiongame.com/#${feedback.questid}">https://quests.expeditiongame.com/#${feedback.questid}</a></p>`;
          return Mail.send(emails, subject, message);
        } else if (feedback.text && feedback.text.length > 0) {
          const subject = `Quest rated ${feedback.rating}/5: ${q.title}`;
          const message = `<p>User feedback:</p>
            <p>"${feedback.text}"</p>
            <p>${feedback.rating} out of 5 stars</p>
            <p>New quest overall rating: ${ratingavg} out of 5 across ${q.ratingcount} ratings.</p>
            <p>Was submitted for ${q.title} by ${q.author}</p>
            <p>They played with ${feedback.players} adventurers on ${feedback.difficulty} difficulty on ${feedback.platform} v${feedback.version}.</p>
            <p>Reviewer email: <a href="mailto:${feedback.email}">${feedback.email}</a></p>
            <p>Link to edit quest: <a href="https://quests.expeditiongame.com/#${feedback.questid}">https://quests.expeditiongame.com/#${feedback.questid}</a></p>
          `;
          return Mail.send(emails, subject, message);
        }
      });
  }

  public submitReportError(feedback: FeedbackAttributes): Promise<any> {
    // Error report: Email us
    return this.s.authenticate()
      .then(() => {
        return this.quest.get(feedback.partition, feedback.questid);
      })
      .then((questInstance: QuestInstance) => {
        const q = this.quest.resolveInstance(questInstance);
        const subject = `Error on ${feedback.platform} v${feedback.version}`;
        const message = `<p>Message: ${feedback.text}</p>
          <p>Quest: ${q.title}</p>
          <p>They played with ${feedback.players} adventurers on ${feedback.difficulty} difficulty.</p>
          <p>Raw platform string: ${feedback.platformDump}</p>
          <p>User email that reported it: <a href="mailto:${feedback.email}">${feedback.email}</a></p>
          <p>Link to edit quest: <a href="https://quests.expeditiongame.com/#${feedback.questid}">https://quests.expeditiongame.com/#${feedback.questid}</a></p>
        `;
        const to = ['expedition+apperror@fabricate.io'];
        if (q.email) {
          to.push(q.email);
        }
        return Mail.send(to, subject, message);
      });
  }

  public submitReportQuest(feedback: FeedbackAttributes): Promise<any> {
    // Report / flag quest: Email us
    return this.s.authenticate()
      .then(() => {
        return this.quest.get(feedback.partition, feedback.questid);
      })
      .then((questInstance: QuestInstance|null) => {
        if (!questInstance) {
          throw new Error('No such quest with id ' + feedback.questid);
        }
        const q = this.quest.resolveInstance(questInstance);

        const subject = `Quest reported: ${q.title}`;
        const message = `<p>Message: ${feedback.text}</p>
          <p>They played with ${feedback.players} adventurers on ${feedback.difficulty} difficulty on ${feedback.platform} v${feedback.version}.</p>
          <p>Raw platform string: ${feedback.platformDump}</p>
          <p>User email that reported it: <a href="mailto:${feedback.email}">${feedback.email}</a></p>
          <p>Link to edit quest: <a href="https://quests.expeditiongame.com/#${feedback.questid}">https://quests.expeditiongame.com/#${feedback.questid}</a></p>
        `;
        const to = ['expedition+apperror@fabricate.io'];
        if (q.email) {
          to.push(q.email);
        }
        return Mail.send(to, subject, message);
      });
  }
}

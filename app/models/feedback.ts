import * as Mail from '../mail'
import {Quest, QuestInstance} from './quests'
import * as Sequelize from 'sequelize'

export interface FeedbackAttributes {
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
    });
  }

  public associate(models: {Quest: Quest}) {
    this.quest = models.Quest;
  }

  public getByQuestId(questid: string): Promise<FeedbackInstance[]> {
    return this.model.findAll({where: {questid, rating: {$ne: null}}});
  };

  public submit(type: 'rating'|'report', feedback: FeedbackAttributes): Promise<FeedbackInstance> {
    // Get quest version, then upsert feedback with the version of the quest.
    // Recalculate ratings on the quest
    // Then send a mail.

    let quest: QuestInstance;
    return this.s.authenticate()
      .then(() => {return this.quest.get('todo', feedback.questid)})
      .then((q: QuestInstance) => {
        quest = q;
        feedback.questid = quest.id;
        return this.model.create(feedback)})
      .then((feedback: FeedbackInstance) => {})
      .then(() => {
        this.quest.recalculateFeedback();
      })
      .then(() => {
        if (this.mail) {
          return this.mail.send('/lists/' + Config.get('MAILCHIMP_CREATORS_LIST_ID') + '/members/', {
            email_address: user.email,
            status: 'subscribed',
          });

          const ratingavg = (quest.ratingavg || 0).toFixed(1);
          const message = `<p>User feedback:</p>
            <p>"${feedback.text}"</p>
            <p>${feedback.rating} out of 5 stars</p>
            <p>New quest overall rating: ${ratingavg} out of 5 across ${quest.ratingcount} ratings.</p>
            <p>Was submitted for ${quest.title} by ${quest.author}</p>
            <p>They played with ${feedback.players} adventurers on ${feedback.difficulty} difficulty on ${feedback.platform} v${feedback.version}.</p>
            <p>User email that reported it: <a href="mailto:${feedback.email}">${feedback.email}</a></p>
            <p>Quest id: ${feedback.questid}</p>
          `;

          if (type === 'rating' && feedback.dataValues.text.length > 0) {
            Mail.send([quest.email, 'expedition+questfeedback@fabricate.io'], 'Quest rated ' + feedback.rating + '/5: ' + quest.title, message, () => {});
          } else if (type === 'report') {
            Mail.send([quest.email, 'expedition+questreported@fabricate.io'], 'Quest reported: ' + quest.title, message, () => {});
          }
        }
      })
      .then((result: any) => {
        console.log(user.email + ' subscribed to creators list');
      });
  }
}


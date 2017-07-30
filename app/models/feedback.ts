const Joi = require('joi');
const Squel = require('squel');

import Mail from '../mail'
import Schemas from './schemas'
import Query from './query'
import Quests from './quests'

const table = 'feedback';

export function getRatingsByQuestId(questId: string, callback: (e: Error, r: any)=>any) {
  Joi.validate(questId, Schemas.feedback.questid, (err: Error, questId: string) => {

    if (err) {
      return callback(err, null);
    }

    const query = Squel.select()
      .from(table)
      .where('questid = ?', questId)
      .where('rating IS NOT NULL');

    return Query.run(query, callback);
  });
};

// TODO: Feedback interface
export function submit(type: 'rating'|'report', feedback: any, callback: (e: Error, r: any)=>any) {
  Joi.validate(feedback, Schemas.feedbackSubmit, (err: Error, feedback: any) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, feedback.questid); // don't hold up the user

    Quests.getById(feedback.questid, (err: Error, quest: any) => {
      if (err) {
        console.log(err);
        quest = {};
      }
      feedback.questversion = quest.questversion;

      Query.upsert(table, feedback, 'questid, userid', (err: Error) => {
        if (err) {
          console.log(err);
        }

        Quests.updateRatings(feedback.questid, (err: Error, quest: any) => {
          if (err) {
            console.log(err);
          }

          const ratingavg = (quest.ratingavg || 0).toFixed(1);

          const htmlMessage = `<p>User feedback:</p>
            <p>"${feedback.text}"</p>
            <p>${feedback.rating} out of 5 stars</p>
            <p>New quest overall rating: ${ratingavg} out of 5 across ${quest.ratingcount} ratings.</p>
            <p>Was submitted for ${quest.title} by ${quest.author}</p>
            <p>They played with ${feedback.players} adventurers on ${feedback.difficulty} difficulty on ${feedback.platform} v${feedback.version}.</p>
            <p>User email that reported it: <a href="mailto:${feedback.email}">${feedback.email}</a></p>
            <p>Quest id: ${feedback.questid}</p>
          `;

          if (type === 'rating' && feedback.text && feedback.text.length > 0) {
            Mail.send([quest.email, 'expedition+questfeedback@fabricate.io'], 'Quest rated ' + feedback.rating + '/5: ' + quest.title, htmlMessage, () => {});
          } else if (type === 'report') {
            Mail.send([quest.email, 'expedition+questreported@fabricate.io'], 'Quest reported: ' + quest.title, htmlMessage, () => {});
          }
        });
      });
    });
  });
};

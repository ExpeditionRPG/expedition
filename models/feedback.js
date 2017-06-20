const Joi = require('joi');
const Squel = require('squel');

const Mail = require('../mail');
const Schemas = require('./schemas');
const Query = require('./query');
const Quests = require('./quests');
const table = 'feedback';


exports.getRatingsByQuestId = function(questId, callback) {
  Joi.validate(questId, Schemas.feedback.questid, (err, questId) => {

    if (err) {
      return callback(err);
    }

    let query = Squel.select()
      .from(table)
      .where('questid = ?', questId)
      .where('rating IS NOT NULL');

    return Query.run(query, callback);
  });
};

exports.submit = function(type, feedback, callback) {
  Joi.validate(feedback, Schemas.feedbackSubmit, (err, feedback) => {
    if (err) {
      return callback(err);
    }
    callback(null, feedback.questid); // don't hold up the user

    // Load the quest to get details like current version and author
    Quests.getById(feedback.questid, (err, quest) => {
      if (err) {
        console.log(err);
        quest = {};
      }
      feedback.questversion = quest.questversion;

      Query.upsert(table, feedback, 'questid, userid', (err) => {
        if (err) {
          console.log(err);
        }

        Quests.updateRatings(feedback.questid, (err, quest) => {
          if (err) {
            console.log(err);
          }

          const htmlMessage = `<p>User feedback:</p>
            <p>"${feedback.text}"</p>
            <p>${feedback.rating} out of 5 stars</p>
            <p>New quest overall rating: ${quest.ratingavg} out of 5 across ${quest.ratingcount} ratings.</p>
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

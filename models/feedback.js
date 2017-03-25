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
      .where('quest_id = ?', questId)
      .where('rating IS NOT NULL');

    return Query.run(query, callback);
  });
};

exports.submit = function(type, feedback, callback) {
  Joi.validate(feedback, Schemas.feedbackSubmit, (err, feedback) => {
    Query.upsert(table, feedback, 'questid, userid', (err) => {
      if (err) {
        return callback(err);
      }
      // don't hold up the user response for background functions like email and recalculating metadata
      callback(null, feedback.questid);
      Quests.getById(feedback.questid, (err, quest) => {
        if (err) {
          quest = {};
        }

        const htmlMessage = `<p>User feedback:</p>
          <p>"${feedback.text}"</p>
          <p>Was submitted for ${quest.title} by ${quest.author}</p>
          <p>They played with ${feedback.players} adventurers on ${feedback.difficulty} difficulty on ${feedback.platform} v${feedback.version}.</p>
          <p>User email that reported it: <a href="mailto:${feedback.useremail}">${feedback.useremail}</a></p>
          <p>Quest id: ${feedback.questid}</p>
        `;

        if (type === 'rating' && feedback.text && feedback.text.length > 0) {
          Mail.send('expedition+questfeedback@fabricate.io', 'Quest rated ' + feedback.rating + '/5: ' + quest.title, htmlMessage, () => {});
        } else if (type === 'report') {
          Mail.send('expedition+questfeedback@fabricate.io', 'Quest reported: ' + quest.title, htmlMessage, () => {});
        }
      });
      Quests.updateRatings(feedback.questid, (err) => {
        if (err) {
          console.log(err);
        }
      });
    });
  });
};

const Joi = require('joi');
const Mailchimp = require('mailchimp-api-v3');

const Query = require('./query');
const Schemas = require('./schemas');
const Config = require('../config');

const mailchimp = new Mailchimp(Config.get('MAILCHIMP_KEY'));

const table = 'users';


exports.upsert = function(user, callback) {
  Joi.validate(user, Schemas.usersUpsert, (err, user) => {

    if (err) {
      return callback(err);
    }

    Query.getId(table, 'id', (err, result) => {

      if (err && err.code !== 404) { // don't fail to upsert if the getId fails
        console.log(err);
      } else {
        mailchimp.post('/lists/' + Config.get('MAILCHIMP_CREATORS_LIST_ID') + '/members/', {
          email_address: user.email,
          status: 'subscribed',
        })
        .then((result) => {
          console.log(user.email + ' subscribed to creators list');
        })
        .catch((err) => {
          console.log('Mailchimp error', err);
        });
      }

      Query.upsert(table, user, 'id', (err, result) => {

        if (err) {
          return callback(err);
        }

        return callback(null, user.id);
      });
    });
  });
};

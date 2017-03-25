const Joi = require('joi');

const Query = require('./query');
const Schemas = require('./schemas');

const table = 'users';


exports.upsert = function(user, callback) {
  Joi.validate(user, Schemas.usersUpsert, (err, user) => {

    if (err) {
      return callback(err);
    }

    Query.upsert(table, user, 'id', (err, result) => {
      return callback(err, user.id);
    });
  });
};

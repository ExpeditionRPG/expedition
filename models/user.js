/*
CREATE TABLE users (
  id VARCHAR(255) NOT NULL,
  PRIMARY KEY(id),
  email VARCHAR(255),
  name VARCHAR(255),
  created TIMESTAMP NULL DEFAULT NOW(),
  last_login TIMESTAMP NULL DEFAULT NOW(),
  tombstone TIMESTAMP NULL DEFAULT NULL
);
*/

const Joi = require('joi');

const Query = require('./query');

const table = 'users';
const schema = {
  id: Joi.string().max(255),
  email: Joi.string().email().max(255),
  name: Joi.string().max(255),

  // metadata
  created: Joi.date(),
  lastLogin: Joi.date(),
  tombstone: Joi.date(),
};
exports.schema = schema;

const schemaUpsert = Object.assign(schema, {
  lastLogin: schema.lastLogin.default(() => new Date(), 'current date'),
  tombstone: schema.tombstone.default(null),
});


exports.upsert = function(user, callback) {
  Joi.validate(user, schemaUpsert, (err, user) => {

    if (err) {
      return callback(err);
    }

    Query.upsert(table, user, (err, result) => {
      return callback(err, user.id);
    });
  });
};

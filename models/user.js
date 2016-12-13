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
const Pg = require('pg');
const Url = require('url');

const Config = require('../config');
const Utils = require('./utils');

Pg.defaults.ssl = true;
const urlparams = Url.parse(Config.get('DATABASE_URL'));
const userauth = urlparams.auth.split(':');
const poolConfig = {
  user: userauth[0],
  password: userauth[1],
  host: urlparams.hostname,
  port: urlparams.port,
  database: urlparams.pathname.split('/')[1],
  ssl: true,
};
const pool = new Pg.Pool(poolConfig);


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


exports.upsert = function(user, cb) {
  Joi.validate(user, schemaUpsert, (err, user) => {

    if (err) {
      return cb(err);
    }

    const query = Utils.generateUpsertSql(table, user);
    Utils.query(pool, query, (err, result) => {
      cb(err, user.id);
    });
  });
};

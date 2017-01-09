"use strict";

const Moment = require('moment');
const Pg = require('pg');
const Squel = require('squel');
const Url = require('url');

const Config = require('../config');

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


// runs a query string using a client from the pool, returns an array of all results converted to JS objects
exports.run = function (query, callback) {

  pool.connect((err, client, done) => {

    if (err) {
      return callback(new Error('error fetching client from pool: ' + err));
    }

    client.query(query, null, (err, result) => {

      done(); //call `done()` to release the client back to the pool

      return callback(err, result.rows.map(objectJsToPg));
    });
  });
};


// returns the first result with id = id converted to a JS object
// returns 404 error if no results found
exports.getId = function (table, id, callback) {

  let query = Squel.select()
      .from(table)
      .where('id = ?', id)
      .limit(1);

  exports.run(query.toString(), (err, results) => {

    if (err) {
      return cb(err);
    }

    if (results.length === 0) {
      return cb({
        code: 404,
        message: 'Not found',
      });
    }

    return cb(null, results[0]);
  });
};


// deletes row with matching id from table. Returns the id deleted.
exports.deleteId = function (table, id, callback) {

  exports.upsert(table, {id: id, tombstone: Date.now()}, (err, result) => {
    return callback(err, id);
  });
};


// inserts the object into the table
exports.create = function (table, object, callback) {

  object = objectJsToPg(updates);

  let query = Squel.insert()
      .into(table)
      .setFields(object);

  exports.run(query.toString(), callback);
};


// inserts object into table, updating it if ID already exists
exports.upsert = function (table, object, callback) {

  object = objectJsToPg(object);

  let query = Squel.insert()
      .into(table)
      .setFields(object)
      .toString();
  query += ' ON CONFLICT (id) DO ';
  query += Squel.update()
      .table('')
      .setFields(object)
      .toString();

  exports.run(query.toString(), callback);
};


// updates object(s) in table
exports.update = function (table, filters, updates, callback) {

  filters = objectJsToPg(filters);
  object = objectJsToPg(updates);

  let query = Squel.update()
        .table(table)
        .setFields(object);

  if (filters != null) {
    Object.keys(filters).forEach((key) => {
      query = query.where(key + ' = ' + filters[key]);
    });
  }

  exports.run(query.toString(), callback);
};


/* ===== INTERNAL HELPERS ===== */

const internals = {
  dateKeys: ['created', 'lastLogin', 'published', 'tombstone', 'updated'], // columns that're always dates
  regexJsToPg: /([A-Z])/g,
  regexPgToJs: /_([a-z])/g,
  replacerJsToPg: (match, p1) => '_' + p1.toLowerCase(),
  replacerPgToJs: (match, p1) => p1.toUpperCase(),
};


// switches prop names from lower camel case (javascript) to lower snake case (postgres)
// ex: 'thisIsAPropName' -> 'this_is_a_prop_name'
function stringJsToPg (str) {

  return str.replace(internals.regexJsToPg, internals.replacerJsToPg);
};


function dateJsToPg (date) {

  return Moment(date).utc().format('YYYY-MM-DD HH:mm:ss');
};


// want to use this on an array of objects? do const newArr = arr.map(objectJsToPg);
function objectJsToPg (object) {

  const result = {};

  Object.keys(object).forEach((key) => {

    let val = object[key]
    if (object[key] instanceof Date || internals.dateKeys.indexOf(key) !== -1) {
      if (val != null) {
        val = dateJsToPg(val);
      }
    }
    result[stringJsToPg(key)] = val;
  });

  return result;
};


// switches prop names from lower snake case (postgres) to lower camel case (javascript)
// ex: 'this_is_a_prop_name' -> 'thisIsAPropName'
function stringPgToJs (str) {

  return str.replace(internals.regexPgToJs, internals.replacerPgToJs);
};


// want to use this on an array of objects? do const newArr = arr.map(objectPgToJs);
function objectPgToJs (object) {

  const result = {};

  Object.keys(object).forEach((key) => {

    result[stringPgToJs(key)] = object[key];
  });

  return result;
};

const Moment = require('moment');
const Squel = require('squel');


const internals = {
  dateKeys: ['created', 'lastLogin', 'published', 'tombstone', 'updated'], // columns that're always dates
  regexJsToPg: /([A-Z])/g,
  regexPgToJs: /_([a-z])/g,
  replacerJsToPg: (match, p1) => '_' + p1.toLowerCase(),
  replacerPgToJs: (match, p1) => p1.toUpperCase(),
};


// runs a query using a client from the pool, returns an array of all results converted to JS objects
exports.query = function (pool, query, callback) {
  pool.connect((err, client, done) => {

    if (err) {
      return callback(new Error('error fetching client from pool: ' + err));
    }

    client.query(query, null, (err, result) => {

      done(); //call `done()` to release the client back to the pool

      return callback(err, result.rows.map(exports.objectJsToPg));
    });
  });
};


// runs a query using a client from the pool, returns the first result converted to a JS object
exports.queryOne = function (pool, query, callback) {
  exports.query(pool, query, (err, result) => {
    return callback(err, result[0]);
  });
};


// returns SQL string to delete from table based on filters provided
// Note: Postgres child objects with ON DELETE trigger references
  // will also be deleted when parent is deleted
exports.generateDeleteSquel = function (table, filters) {

  filters = exports.objectJsToPg(filters);

  let query = Squel.delete()
      .from(table);

  if (filters != null) {
    Object.keys(filters).forEach((key) => {
      query = query.where(key + ' = ' + filters[key]);
    });
  }

  return query.toString() + ';';
};


// returns SQL string to insert object into table
exports.generateCreateSql = function (table, object) {

  object = exports.objectJsToPg(object);

  return Squel.insert()
      .into(table)
      .setFields(object)
      .toString() + ';';
};


// returns SQL string to insert object into table, updating it if ID already exists
exports.generateUpsertSql = function (table, object) {

  object = exports.objectJsToPg(object);

  let query = Squel.insert()
      .into(table)
      .setFields(object)
      .toString();
  query += ' ON CONFLICT (id) DO ';
  query += Squel.update()
      .table('')
      .setFields(object)
      .toString();

  return query.toString() + ';';
};


// returns SQL string to update object(s) from table
exports.generateUpdateSql = function (table, filters, updates) {

  filters = exports.objectJsToPg(filters);
  updates = exports.objectJsToPg(updates);

  let query = Squel.update()
        .table(table)
        .setFields(updates);

  if (filters != null) {
    Object.keys(filters).forEach((key) => {
      query = query.where(key + ' = ' + filters[key]);
    });
  }

  return query.toString() + ';';
};


// switches prop names from lower camel case (javascript) to lower snake case (postgres)
// ex: 'thisIsAPropName' -> 'this_is_a_prop_name'
exports.stringJsToPg = function (str) {

  return str.replace(internals.regexJsToPg, internals.replacerJsToPg);
};


exports.dateJsToPg = function (date) {

  return Moment(date).utc().format('YYYY-MM-DD HH:mm:ss');
};


// want to use this on an array of objects? do const newArr = arr.map(objectJsToPg);
exports.objectJsToPg = function (object) {

  const result = {};

  Object.keys(object).forEach((key) => {

    let val = object[key]
    if (object[key] instanceof Date || internals.dateKeys.indexOf(key) !== -1) {
      if (val != null) {
        val = exports.dateJsToPg(val);
      }
    }
    result[exports.stringJsToPg(key)] = val;
  });

  return result;
};


// switches prop names from lower snake case (postgres) to lower camel case (javascript)
// ex: 'this_is_a_prop_name' -> 'thisIsAPropName'
exports.stringPgToJs = function (str) {

  return str.replace(internals.regexPgToJs, internals.replacerPgToJs);
};


// want to use this on an array of objects? do const newArr = arr.map(objectPgToJs);
exports.objectPgToJs = function (object) {

  const result = {};

  Object.keys(object).forEach((key) => {

    result[exports.stringPgToJs(key)] = object[key];
  });

  return result;
};

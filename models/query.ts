const Moment = require('moment');
const Pg = require('pg');
const Squel = require('squel').useFlavour('postgres');
const Url = require('url');

import Config from '../config'

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


// runs a Squel query object using a client from the pool
// returns an array of all results converted to JS objects
export function run(query: any, callback: (e: Error, v: any) => any) {

  pool.connect((err: Error, client: any, done: ()=>void) => {

    if (err) {
      return callback(new Error('error fetching client from pool: ' + err), null);
    }

    query = query.toParam({ numberedParameters: true });

    console.log('SQL command:', query);

    client.query(query.text, query.values, (err: Error, result: any) => {

      done(); // release the client back to the pool

      if (err) {
        return callback(err, null);
      }

      return callback(null, result.rows.map(internals.objectPgToJs));
    });
  });
};


// returns the first result with id = id converted to a JS object
// returns 404 error if no results found
export function getId(table: any, id: string, callback: (e: Error, v: any) => any) {

  let query = Squel.select()
      .from(table)
      .where('id = ?', id)
      .limit(1);

  run(query, (err: Error, results: any) => {

    if (err) {
      return callback(err, null);
    }

    if (results.length === 0) {
      const e = new Error('Not found');
      (e as any).code = 404; // TODO: this in a better way
      return callback(e, null);
    }

    return callback(null, results[0]);
  });
};


// deletes row with matching id from table. Returns the id deleted.
export function deleteId(table: any, id: string, callback: (e: Error, v: any) => any) {

  upsert(table, {id: id, tombstone: Date.now()}, 'id', (err: Error, result: any) => {
    return callback(err, id);
  });
};


// inserts the object into the table
export function create(table: any, object: any, callback: (e: Error, v: any) => any) {

  object = internals.objectJsToPg(object);

  let query = Squel.insert()
      .into(table)
      .setFields(object);

  run(query, callback);
};


// inserts object into table, updating it if [id] field already exists
// if checking against a combination of fields, pass string 'field1, field2'
export function upsert(table: any, object: any, id: string, callback: (e: Error, v: any) => any) {

  object = internals.objectJsToPg(object);

  let query = Squel.insert()
      .into(table)
      .setFields(object)
      .onConflict(id, object);

  run(query, callback);
};


// updates object(s) in table
export function update(table: any, filters: any, updates: any, callback: (e: Error, v: any) => any) {

  filters = internals.objectJsToPg(filters);
  let object = internals.objectJsToPg(updates);

  let query = Squel.update()
        .table(table)
        .setFields(object);

  if (filters != null) {
    Object.keys(filters).forEach((key) => {
      query = query.where(key + ' = ' + filters[key]);
    });
  }

  run(query, callback);
};


/* ===== INTERNAL HELPERS ===== */

const internals: any = {
  dateKeys: ['created', 'lastLogin', 'published', 'tombstone', 'updated'], // columns that're always dates
  regexKeyJsToPg: /([A-Z])/g,
  regexKeyPgToJs: /_([a-z])/g,
  replacerKeyJsToPg: (match: any, p1: string) => '_' + p1.toLowerCase(),
  replacerKeyPgToJs: (match: any, p1: string) => p1.toUpperCase(),
};


internals.dateJsToPg = function (date: Date) {
  return Moment(date).utc().format('YYYY-MM-DD HH:mm:ss');
};


internals.stringJsToPg = function (str: string) {
  return str;
}

// switches prop names from lower camel case (javascript) to lower snake case (postgres)
// ex: 'thisIsAPropName' -> 'this_is_a_prop_name'
internals.keyJsToPg = function (str: string) {

  return str.replace(internals.regexKeyJsToPg, internals.replacerKeyJsToPg);
};


// want to use this on an array of objects? do const newArr = arr.map(internals.objectJsToPg);
internals.objectJsToPg = function (object: any) {

  const result: any = {};

  Object.keys(object).forEach((key: string) => {

    let val: any = object[key];
    if (val instanceof Date || internals.dateKeys.indexOf(key) !== -1) {
      if (val != null) {
        val = internals.dateJsToPg(val);
      }
    }
    else if (typeof val === 'string') {
      val = internals.stringJsToPg(val);
    }
    result[internals.keyJsToPg(key)] = val;
  });

  return result;
};


// switches prop names from lower snake case (postgres) to lower camel case (javascript)
// ex: 'this_is_a_prop_name' -> 'thisIsAPropName'
internals.keyPgToJs = function (str: string) {

  return str.replace(internals.regexKeyPgToJs, internals.replacerKeyPgToJs);
};


internals.stringPgToJs = function (str: string) {
  return str.replace(/''/g, "\'");
};


// want to use this on an array of objects? do const newArr = arr.map(internals.objectPgToJs);
internals.objectPgToJs = function (object: any) {

  const result: any = {};

  Object.keys(object).forEach((key: string) => {

    let val: any = object[key];
    if (typeof val === 'string') {
      val = internals.stringPgToJs(val);
    }
    result[internals.keyPgToJs(key)] = val;
  });

  return result;
};

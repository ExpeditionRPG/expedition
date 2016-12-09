/*
CREATE TABLE quests (
  id VARCHAR(255) NOT NULL,
  PRIMARY KEY(id),
  published TIMESTAMP NULL DEFAULT NULL,
  tombstone TIMESTAMP NULL DEFAULT NULL,
  publishedurl VARCHAR(2048),
  userid VARCHAR(255),
  author VARCHAR(255),
  email VARCHAR(255),
  maxplayers INT,
  maxtimeminutes INT,
  minplayers INT,
  mintimeminutes INT,
  summary VARCHAR(1024),
  title VARCHAR(255),
  url VARCHAR(2048)
);
*/

const url = require('url')
const pg = require('pg');
const namedPG = require('node-postgres-named');

const config = require('../config');
const cloudstorage = require('../lib/cloudstorage');
const toMeta = require('../translation/to_meta');

pg.defaults.ssl = true;
const urlparams = url.parse(config.get('DATABASE_URL'));
const userauth = urlparams.auth.split(':');
const poolconfig = {
  user: userauth[0],
  password: userauth[1],
  host: urlparams.hostname,
  port: urlparams.port,
  database: urlparams.pathname.split('/')[1],
  ssl: true
};

const pool = new pg.Pool(poolconfig);
namedPG.patch(pool);

function search(userId, params, cb) {
  if (!params) {
    cb(new Error("Search params not given"));
  }

  var filter_query = 'SELECT * FROM quests WHERE tombstone IS NULL';
  var filter_params = {};

  if (params.id) {
    filter_query += ' AND id=$id';
    filter_params['id'] = params.id;
  }

  if (params.owner) {
    filter_query += ' AND userid=$userid';
    filter_params['userid'] = params.owner;
  }

  // Require results to be published if we're not querying our own quests
  if (params.owner !== userId || userId == "") {
    filter_query += ' AND published IS NOT NULL';
  }

  if (params.players) {
    filter_query += ' AND minplayers <= $players AND maxplayers >= $players';
    filter_params['players'] = parseInt(params.players);
  }

  if (params.search) {
    filter_query += ' AND (title LIKE $searchtext OR summary LIKE $searchtext)';
    filter_params['searchtext'] = "%" + params.search + "%";
  }

  if (params.published_after) {
    filter_query += ' AND EXTRACT(EPOCH FROM published) > $after';
    filter_params['after'] = parseInt(params.published_after);
  }

  if (params.token) {
    console.log("TODO Start token " + token)
  }

  if (params.order) {
    filter_query += ' ORDER BY $order ' + ((params.order[0] === '+') ? "ASC" : "DESC");
    filter_params['order'] = params.order.substr(1);
  }

  const limit = Math.max(params.limit || 0, 100);
  filter_query += ' LIMIT $limit';
  filter_params['limit'] = limit;

  pool.query(filter_query, filter_params, function(err, results) {
    if (err) {
      return cb(err);
    }
    const hasMore = results.rows.length === limit ? token + results.rows.length : false;
    cb(null, results.rows, hasMore);
  });
}
function publish(user, docid, xml, cb) {
  // TODO: Validate here

  if (!xml) {
    return cb("Could not publish - no xml data.")
  }

  if (docid === undefined) {
    throw new Error('Invalid Quest ID');
  }

  // Invariant: quest ID is present after this point
  console.log("Publishing quest " + docid + " owned by " + user);

  const cloud_storage_data = {
    gcsname: user + "/" + docid + "/" + Date.now() + ".xml",
    buffer: xml
  }

  // We can run this in parallel with the Datastore model.
  cloudstorage.upload(cloud_storage_data, function(err, data) {
    if (err) {
      console.log(err);
    }
  });

  var meta = toMeta.fromXML(xml);

  meta.userid = user;
  meta.id = user + '_' + docid;
  meta.publishedurl = cloudstorage.getPublicUrl(cloud_storage_data.gcsname);
  var params = ['id', 'userid', 'publishedurl', 'author', 'email', 'maxplayers', 'maxtimeminutes', 'minplayers', 'mintimeminutes', 'summary', 'title', 'url'];
  var columns = params.join(',');
  var interleaved = [];
  for (var i = 0; i < params.length; i++) {
    interleaved.push(params[i] + '=$' + params[i]);
    params[i] = '$' + params[i];
  }

  const query_text = 'INSERT INTO quests ('+ columns +',published,tombstone) VALUES (' + params.join(',') + ',NOW(),NULL) ON CONFLICT (id) DO UPDATE SET ' + interleaved.join(',') + ',published=NOW(),tombstone=NULL';
  pool.query(query_text, meta, function(err, result) {
    if (err) {
      return cb(err);
    }
    cb(null, meta.id);
  });
}

function unpublish(user, docid, cb) {
  if (docid === undefined) {
    throw new Error('Invalid Quest ID');
  }

  console.log("Unpublishing quest " + docid + " owned by " + user);
  const id = user + '_' + docid;
  pool.query('UPDATE quests SET tombstone=NOW() WHERE id=$id', {id: id}, function(err, result) {
    if (err) {
      return cb(err);
    }
    cb(null, id);
  });
}

function read(id, cb) {
  pool.query('SELECT * FROM quests WHERE id=$id LIMIT 1', {id: id}, function(err, results) {
    if (err) {
      return cb(err);
    }

    if (results.length !== 1) {
      return cb({
        code: 404,
        message: 'Not found'
      });
    }
    cb(null, results[0]);
  });
}

module.exports = {
  read: read,
  search: search,
  publish: publish,
  unpublish: unpublish,
};

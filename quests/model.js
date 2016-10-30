// Copyright 2015-2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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

'use strict';

var gcloud = require('google-cloud');
var config = require('../config');
var pg = require('pg');
var namedPG = require('node-postgres-named');

pg.defaults.ssl = true;
var cloudstorage = require('../lib/cloudstorage');
var toMeta = require('../translation/to_meta');

// We use base62 for encoding/decoding datastore keys into something more easily typeable on a mobile device.
var Base62 = require('base62');

function connect(cb) {
  console.log(config.get('DATABASE_URL'));
  pg.connect(config.get('DATABASE_URL'), function(err, client) {
    if (err) throw err;
    namedPG.patch(client);
    cb(client);
  });
}

function searchQuests(userId, params, cb) {
  if (!params) {
    cb(new Error("Search params not given"));
  }

  var filter_query = 'SELECT * FROM quests WHERE tombstone IS NULL';
  var filter_params = {};

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

  var limit = Math.max(params.limit || 0, 100);
  filter_query += ' LIMIT $limit';
  filter_params['limit'] = limit;

  connect(function(connection) {
    console.log(filter_query);
    console.log(filter_params);
    var query = connection.query(filter_query, filter_params, function(err, results) {
      if (err) {
        return cb(err);
      }
      var hasMore = results.rows.length === limit ? token + results.rows.length : false;
      cb(null, results.rows, hasMore);
    });
    console.log(query.sql);
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

  var cloud_storage_data = {
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

  connect(function(connection) {
    var query_text = 'INSERT INTO quests ('+ columns +',published,tombstone) VALUES (' + params.join(',') + ',NOW(),NULL) ON CONFLICT (id) DO UPDATE SET ' + interleaved.join(',') + ',published=NOW(),tombstone=NULL';
    var q = connection.query(query_text, meta, function(err, result) {
      if (err) {
        return cb(err);
      }
      cb(null, meta.id);
    });
    console.log(q.text);
  });
}

function unpublish(user, docid, cb) {
  if (docid === undefined) {
    throw new Error('Invalid Quest ID');
  }

  console.log("Unpublishing quest " + docid + " owned by " + user);
  connect(function(connection) {
    var id = user + '_' + docid;
    var q = connection.query('UPDATE quests SET tombstone=NOW() WHERE id=$id', {id: id}, function(err, result) {
      if (err) {
        return cb(err);
      }
      cb(null, id);
    });
    console.log(q.text);
  });
}

function read(id, cb) {
  connect(function(connection) {
    var q = connection.query('SELECT * FROM quests WHERE id=$id LIMIT 1', {id: id}, function(err, results) {
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

    console.log(q.text);
  });
}

module.exports = {
  read: read,
  searchQuests: searchQuests,
  publish: publish,
  unpublish: unpublish,
};

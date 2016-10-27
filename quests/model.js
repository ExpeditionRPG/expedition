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
  created TIMESTAMP,
  modified TIMESTAMP NULL DEFAULT NULL,
  published TIMESTAMP NULL DEFAULT NULL,
  shared TIMESTAMP NULL DEFAULT NULL,
  tombstone TIMESTAMP NULL DEFAULT NULL,
  draftUrl VARCHAR(2048),
  publishedUrl VARCHAR(2048),
  user VARCHAR(255),
  metaAuthor VARCHAR(255),
  metaEmail VARCHAR(255),
  metaMaxPlayers INT,
  metaMaxTimeMinutes INT,
  metaMinPlayers INT,
  metaMinTimeMinutes INT,
  metaSummary VARCHAR(1024) CHARACTER SET UTF8 COLLATE UTF8_GENERAL_CI,
  metaTitle VARCHAR(255) CHARACTER SET UTF8 COLLATE UTF8_GENERAL_CI,
  metaUrl VARCHAR(2048)
);
*/

'use strict';

var gcloud = require('google-cloud');
var config = require('../config');
//var background = require('../lib/background');
var mysql = require('mysql');
var cloudstorage = require('../lib/cloudstorage');
var toMeta = require('../translation/to_meta');

// We use base62 for encoding/decoding datastore keys into something more easily typeable on a mobile device.
var Base62 = require('base62');

function getConnection() {
  return mysql.createConnection({
    database: 'quests',
    host: config.get('MYSQL_HOST'),
    user: config.get('MYSQL_USER'),
    password: config.get('MYSQL_PASSWORD')
  });
}

//var ds = gcloud.datastore({
//  projectId: config.get('GCLOUD_PROJECT')
//});
//var user_kind = 'User';
//var quest_kind = 'Quest';

function getRawXMLUrl(user, quest) {
  if (config.get('NODE_ENV') === 'production') {
    return "http://expedition-quest-ide.appspot.com/raw/" + user + "/" + quest;
  } else {
    return "http://localhost:8080/raw/" + user + "/" + quest;
  }
}

function searchQuests(userId, params, cb) {
  if (!params) {
    cb(new Error("Search params not given"));
  }

  var connection = getConnection();
  var filter_string = "SELECT * FROM `quests` WHERE tombstone IS NULL";
  var filter_vars = [];

  if (params.owner) {
    filter_string += " AND user=?";
    filter_vars.push(params.owner);
  }

  // Require results to be published if we're not querying our own quests
  if (params.owner !== userId || userId == "") {
    filter_string += " AND published IS NOT NULL";
  }

  if (params.players) {
    var players = parseInt(params.players);
    filter_string += " AND metaMinPlayers <= ? AND metaMaxPlayers >= ?";
    filter_vars.push(players);
    filter_vars.push(players);
  }

  if (params.search) {
    var params_like = "%" + params.search + "%";
    filter_string += " AND (metaTitle LIKE ? OR metaSummary LIKE ?)";
    filter_vars.push(params_like);
    filter_vars.push(params_like);
  }

  if (params.published_after) {
    filter_string += " AND UNIX_TIMESTAMP(published) > ?";
    filter_vars.push(parseInt(params.published_after));
  }

  if (params.token) {
    console.log("TODO Start token " + token)
  }

  if (params.order) {
    filter_string += " ORDER BY " + connection.escapeId(params.order.substr(1)) + " " + ((params.order[0] === '+') ? "ASC" : "DESC");
  }

  var limit = Math.max(params.limit || 0, 100);
  filter_string += " LIMIT ?";
  filter_vars.push(limit);

  // Also search for unlisted quests and list them first if we have an exact match on ID
  // and the search string is base62-like. These results will be displayed first.
  if (params.search && params.search.match(/^[A-Za-z0-9]+$/)) {
    filter_string = "(SELECT * FROM `quests` WHERE id=? AND shared IS NOT NULL AND tombstone IS NULL LIMIT 1) UNION (" + filter_string + ")";
    filter_vars.unshift(params.search);
  }

  var query = connection.query(filter_string, filter_vars, function(err, results) {
    if (err) {
      return cb(err);
    }
    var hasMore = results.length === limit ? token + results.length : false;
    cb(null, results, hasMore);
  });
  console.log(query.sql);
  return connection.end();
}
function publish(user, id, xml, cb) {
  // TODO: Validate here

  if (!xml) {
    return cb("Could not publish - no xml data.")
  }

  if (id === undefined) {
    throw new Error('Invalid Quest ID');
  }

  var connection = getConnection();

  // Invariant: quest ID is present after this point
  console.log("Publishing quest " + id + " owned by " + user);

  var cloud_storage_data = {
    gcsname: user + "/" + id + "/" + Date.now() + ".xml",
    buffer: xml
  }

  // We can run this in parallel with the Datastore model.
  cloudstorage.upload(cloud_storage_data, function(err, data) {
    if (err) {
      console.log(err);
    }
  });

  var meta = toMeta.fromXML(xml);

  meta.user = user;
  meta.id = user + '_' + id;
  meta.publishedUrl = cloudstorage.getPublicUrl(cloud_storage_data.gcsname);
  var params = ['id', 'user', 'publishedUrl', 'metaAuthor', 'metaEmail', 'metaMaxPlayers', 'metaMaxTimeMinutes', 'metaMinPlayers', 'metaMinTimeMinutes', 'metaSummary', 'metaTitle', 'metaUrl'];
  var columns = params.join(',');
  var values = [];
  var basevalues = [];
  for (var i = 0; i < params.length; i++) {
    values.push(meta[params[i]]);
    basevalues.push('?');
  }
  for (var i = 0; i < params.length; i++) {
    values.push(meta[params[i]]);
    params[i] += "=?";
  }

  var query = connection.query('INSERT INTO `quests` ('+ columns +',published) VALUES (' + basevalues.join(',') + ',NOW()) ON DUPLICATE KEY UPDATE ' + params.join(',') + ',published=NOW()', values, function(err, result) {
    if (err) {
      return cb(err);
    }
    cb(null, id);
  });
  console.log(query.sql);
  return connection.end();
}

function unpublish(user, id, cb) {
  if (id === undefined) {
    throw new Error('Invalid Quest ID');
  }
  var connection = getConnection();

  console.log("Unpublishing quest " + id + " owned by " + user);
  var query = connection.query('DELETE FROM `quests` WHERE id=?', [user + '_' + id], function(err, result) {
    if (err) {
      return cb(err);
    }
    cb(null, id);
  });
  console.log(query.sql);
  return connection.end();
}

function read(id, cb) {
  var connection = getConnection();
  connection.query('SELECT * FROM `quests` WHERE id=? LIMIT 1', [id], function(err, results) {
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
  return connection.end();
}

module.exports = {
  read: read,
  searchQuests: searchQuests,
  publish: publish,
  unpublish: unpublish,
};

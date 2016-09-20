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
  id INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY(id),
  created TIMESTAMP,
  meta_author VARCHAR(255),
  meta_email VARCHAR(255),
  meta_maxPlayers INT,
  meta_maxTimeMinutes INT,
  meta_minPlayers INT,
  meta_minTimeMinutes INT,
  meta_summary VARCHAR(1024) CHARACTER SET UTF8 COLLATE UTF8_GENERAL_CI,
  meta_title VARCHAR(255) CHARACTER SET UTF8 COLLATE UTF8_GENERAL_CI,
  meta_url VARCHAR(2048),
  modified TIMESTAMP NULL DEFAULT NULL,
  published TIMESTAMP NULL DEFAULT NULL,
  tombstone TIMESTAMP NULL DEFAULT NULL,
  url VARCHAR(2048),
  user VARCHAR(255)
);
*/

'use strict';

var gcloud = require('gcloud');
var config = require('../config');
//var background = require('../lib/background');
var mysql = require('mysql');
var cloudstorage = require('../lib/cloudstorage');

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

function fromDatastore (obj) {
  obj.id = Base62.encode(obj.id);
  return obj;
}

function toFullKey(quest) {
  return Base62.decode(quest);
}

function searchQuests(userId, params, cb) {
  if (!params) {
    cb(new Error("Search params not given"));
  }

  var connection = getConnection();

  var filter_string = "";
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
    filter_string += " AND meta_minPlayers <= ? AND meta_maxPlayers >= ?";
    filter_vars.push(players);
    filter_vars.push(players);
  }

  if (params.search) {
    var params_like = "%" + params.search + "%";
    filter_string += " AND (meta_title LIKE ? OR meta_summary LIKE ?)";
    filter_vars.push(params_like);
    filter_vars.push(params_like);
  }

  if (params.token) {
    console.log("TODO Start token " + token)
  }

  var limit = Math.max(params.limit || 0, 100);
  filter_string += " LIMIT ?";
  filter_vars.push(limit);

  var query = connection.query('SELECT * FROM `quests` WHERE tombstone IS NULL' + filter_string, filter_vars, function(err, results) {
    if (err) {
      return cb(err);
    }
    console.log(results.length + " results");
    var hasMore = results.length === limit ? token + results.length : false;
    cb(null, results.map(fromDatastore), hasMore);
  });
  console.log(query.sql);
  return connection.end();
}

// Creates a new quest or updates an existing quest with new data. The provided
// data is automatically translated into Datastore format.
// TODO: This should automatically keep versions, and not store data directly.
function update(user, id, quest, xml, cb) {
  // TODO: Validate here

  if (!xml) {
    return cb("Could not update - no xml data.")
  }

  var connection = getConnection();

  if (id === undefined || id === "null" || id === "undefined") {
    console.log("Saving new quest owned by " + user);

    // Do a mini-save to storage to get the new ID
    connection.query(
      'INSERT INTO `quests` (created, user) VALUES (NOW(), ?)', [user],
      function (err, result) {
        if (err) {
          return cb(err);
        }
        return update(user, Base62.encode(result.insertId), quest, xml, cb);
      }
    );
    return connection.end();
  }

  // Invariant: quest ID is present after this point
  console.log("Updating quest " + id + " owned by " + user);

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

  quest.url = cloudstorage.getPublicUrl(cloud_storage_data.gcsname);

  var params = ['url', 'meta_author', 'meta_email', 'meta_maxPlayers', 'meta_maxTimeMinutes', 'meta_minPlayers', 'meta_minTimeMinutes', 'meta_summary', 'meta_title', 'meta_url'];
  var values = [];
  for (var i = 0; i < params.length; i++) {
    values.push(quest[params[i]]);
    params[i] += "=?";
  }
  values.push(user);
  values.push(toFullKey(id));


  // Tombstone must be explicitly set for indexing purposes.
  // Modified will always be the current time.
  var query = connection.query(
    'UPDATE `quests` SET tombstone=NULL,modified=NOW(),' + params.join(',') + ' WHERE user=? AND id=? LIMIT 1', values, function(err, result) {
      if (err) {
        return cb(err);
      }
      cb(null, id);
  });
  console.log(query.sql);
  return connection.end();
}

function save(entity, cb) {
  console.log("TODO: SAVE");
}

function publish(user, id, published, cb) {
  var connection = getConnection();
  connection.query('UPDATE quests SET published=' + ((published) ? 'NOW()' : 'NULL') + ' WHERE user=? AND id=? LIMIT 1', [user, toFullKey(id)],
    function(err, result) {
      if (err) {
        return cb(err);
      }
      cb(null, published);
    }
  );
  return connection.end();
}

function tombstone(user, id, cb) {
  var connection = getConnection();
  connection.query('UPDATE quests SET tombstone=NOW() WHERE user=? AND id=? LIMIT 1', [user, toFullKey(id)],
      function(err, result) {
    if (err) {
      return cb(err);
    }
    cb(null);
  });
  return connection.end();
}

function read(loggedInUser, id, cb) {
  var connection = getConnection();

  // If we have a user (i.e. internal read), set, don't require quests to be published.
  var query_string;
  var query_values;
  if (loggedInUser) {
    query_string = 'SELECT * FROM `quests` WHERE user=? AND id=? LIMIT 1';
    query_values = [loggedInUser, toFullKey(id)];
  } else {
    query_string = 'SELECT * FROM `quests` WHERE id=? AND published IS NOT NULL LIMIT 1';
    query_values = [toFullKey(id)];
  }

  connection.query(query_string, query_values, function(err, results) {
    if (err) {
      return cb(err);
    }

    if (results.length !== 1) {
      return cb({
        code: 404,
        message: 'Not found'
      });
    }
    cb(null, fromDatastore(results[0]));
  });
  return connection.end();
}

module.exports = {
  read: read,
  update: update,
  tombstone: tombstone,
  searchQuests: searchQuests,
  publish: publish
};

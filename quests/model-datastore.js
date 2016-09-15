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

'use strict';

var gcloud = require('gcloud');
var config = require('../config');
//var background = require('../lib/background');
var cloudstorage = require('../lib/cloudstorage');

// We use base62 for encoding/decoding datastore keys into something more easily typeable on a mobile device.
var Base62 = require('base62');

var ds = gcloud.datastore({
  projectId: config.get('GCLOUD_PROJECT')
});
var user_kind = 'User';
var quest_kind = 'Quest';

function getRawXMLUrl(user, quest) {
  if (config.get('NODE_ENV') === 'production') {
    return "http://expedition-quest-ide.appspot.com/raw/" + user + "/" + quest;
  } else {
    return "http://localhost:8080/raw/" + user + "/" + quest;
  }
}

// TODO: Decommision this.
// Translates from Datastore's entity format to
// the format expected by the application.
//
// Datastore format:
//   {
//     key: [kind, id],
//     data: {
//       property: value
//     }
//   }
//
// Application format:
//   {
//     id: id,
//     property: value
//   }
function fromDatastore (obj) {
  obj.data.id = Base62.encode(obj.key.id);
  return obj.data;
}

// TODO: Decommision this.
// Translates from the application's format to the datastore's
// extended entity property format. It also handles marking any
// specified properties as non-indexed. Does not translate the key.
//
// Application format:
//   {
//     id: id,
//     property: value,
//     unindexedProperty: value
//   }
//
// Datastore extended format:
//   [
//     {
//       name: property,
//       value: value
//     },
//     {
//       name: unindexedProperty,
//       value: value,
//       excludeFromIndexes: true
//     }
//   ]
function toDatastore (obj, user, nonIndexed) {
  nonIndexed = nonIndexed || [];
  var results = [];
  Object.keys(obj).forEach(function (k) {
    if (obj[k] === undefined || obj[k] === 'user') {
      return;
    }
    results.push({
      name: k,
      value: obj[k],
      excludeFromIndexes: nonIndexed.indexOf(k) !== -1
    });
  });

  results.push({
    name: 'user',
    value: user,
    excludeFromIndexes: false
  });
  return results;
}

function toFullKey(quest) {
  return ds.key([quest_kind, Base62.decode(quest)]);
}

function getOwnedQuests (userId, limit, token, cb) {
  var q = ds.createQuery([quest_kind])
    .filter('user', String(userId))
    .filter('tombstone', null)
    .limit(limit)
    .start(token);

  ds.runQuery(q, function (err, entities, nextQuery) {
    if (err) {
      return cb(err);
    }
    var hasMore = entities.length === limit ? nextQuery.startVal : false;
    cb(null, entities.map(fromDatastore), hasMore);
  });
}

// Creates a new quest or updates an existing quest with new data. The provided
// data is automatically translated into Datastore format.
// TODO: This should automatically keep versions, and not store data directly.
function update (user, id, quest, xml, cb) {
  // Tombstone must be explicitly set for indexing purposes.
  quest.tombstone = null;
  quest.modified = Date.now();

  if (!xml) {
    return cb("Could not update - no xml data.")
  }

  if (id === undefined || id === "null" || id === "undefined") {
    var key = ds.key([quest_kind]);
    console.log("Saving new quest owned by " + user);

    // Do a mini-save to storage to get the new ID
    var entity = {key: key, data: toDatastore({}, user)};
    ds.save(entity, function(err) {
      if (err) {
        return cb(err);
      }
      update(user, fromDatastore(entity).id, quest, xml, cb);
    });
    return;
  }

  // Not transactional - auth checking shouldn't cause race conditions.
  read(user, id, function(err, entity) {
    if (err) {
      return cb(err);
    }

    if(entity.user !== user) {
      return cb(new Error("You do not own this quest."));
    }

    // Invariant: quest ID is present after this point
    // and quest is owned
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

    var entity = {
      key: toFullKey(id),
      data: toDatastore(quest, user)
    };

    ds.save(
      entity,
      function (err) {
        if (err) {
          return cb(err);
        }

        quest.id = fromDatastore(entity).id;
        cb(null, quest);
      }
    );
  });
}

function setPublishedState(user, id, published, cb) {
  var transaction = ds.transaction();

  // Done inside a transaction to prevent concurrency bugs on read-modify-write.
  transaction.run(function (err) {
    if (err) {
      return cb(err);
    }

    transaction.get(toFullKey(id), function (err, quest) {
      if (err) {
        return transaction.rollback(function (_err) {
          return cb(_err || err);
        });
      }

      if (!quest) {
        // Nothing to do
        return cb();
      }

      if (quest.data.user !== user) {
        return cb(new Error("Cannot publish quest you do not own."));
      }

      quest.data.published = (published) ? Date.now() : undefined;
      transaction.save(quest);
      transaction.commit(function (err) {
        if (err) {
          return cb(err);
        }
        cb(null, id); // The transaction completed successfully.
      });
    });
  });
}

function tombstone (user, id, cb) {
  var transaction = ds.transaction();

  // Done inside a transaction to prevent concurrency bugs on read-modify-write.
  transaction.run(function (err) {
    if (err) {
      return cb(err);
    }

    transaction.get(toFullKey(id), function (err, quest) {
      if (err) {
        return transaction.rollback(function (_err) {
          return cb(_err || err);
        });
      }

      if (!quest) {
        // Nothing to do
        return cb();
      }

      if (quest.data.user !== user) {
        return cb(new Error("Cannot publish quest you do not own."));
      }

      quest.data.tombstone = Date.now();
      transaction.save(quest);
      transaction.commit(function (err) {
        if (err) {
          return cb(err);
        }
        cb(); // The transaction completed successfully.
      });
    });
  });
}

function read (user, id, cb) {
  ds.get(toFullKey(id), function (err, entity) {
    if (err) {
      return cb(err);
    }
    if (!entity || entity.data.user !== user) {
      return cb({
        code: 404,
        message: 'Not found'
      });
    }
    cb(null, fromDatastore(entity));
  });
}

function readPublished(id, cb) {
 ds.get(toFullKey(id), function (err, entity) {
    if (err) {
      return cb(err);
    }
    if (!entity || !entity.data.published) {
      return cb({
        code: 404,
        message: 'Not found'
      });
    }
    cb(null, fromDatastore(entity));
  });
}

function _delete (user, id, cb) {
  ds.delete(toFullKey(id), cb);
}

module.exports = {
  create: function (data, queueBook, cb) {
    update(null, data, queueBook, cb);
  },
  read: read,
  readPublished: readPublished,
  update: update,
  tombstone: tombstone,
  unsafedelete: _delete,
  getOwnedQuests: getOwnedQuests,
  setPublishedState: setPublishedState
};

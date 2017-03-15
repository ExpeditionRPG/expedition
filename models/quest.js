"use strict";

/*
CREATE TABLE quests (
  id VARCHAR(255) NOT NULL,
  PRIMARY KEY(id),
  published TIMESTAMP NULL DEFAULT NOW(),
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

const Joi = require('joi');
const Pg = require('pg');
const Squel = require('squel');
const Url = require('url');
const Cheerio = require('cheerio');

const Config = require('../config');
const CloudStorage = require('../lib/cloudstorage');
const Mail = require('../mail');
const User = require('./user');
const Query = require('./query');

Pg.defaults.ssl = true;
const urlparams = Url.parse(Config.get('DATABASE_URL'));
const userauth = urlparams.auth.split(':');
const poolConfig = {
  user: userauth[0],
  password: userauth[1],
  host: urlparams.hostname,
  port: urlparams.port,
  database: urlparams.pathname.split('/')[1],
  ssl: true
};
const pool = new Pg.Pool(poolConfig);


const table = 'quests';
const schema = {
  id: Joi.string().max(255), // <userId>_<docId>
  publishedurl: Joi.string().uri().max(2048),
  userid: User.schema.id,
  author: Joi.string().max(255),
  email: Joi.string().email().max(255),
  maxplayers: Joi.number().min(1).max(20),
  maxtimeminutes: Joi.number().min(1),
  minplayers: Joi.number().min(1).max(20),
  mintimeminutes: Joi.number().min(1),
  summary: Joi.string().max(1024),
  title: Joi.string().max(255),
  url: Joi.string().max(2048), // Note: not required to be a URI because other parts of the code
                               // still want it to exclude http://

  // metadata
  published: Joi.date(),
  tombstone: Joi.date(),
};
exports.schema = schema;

const schemaSearch = Object.assign(schema, {
  order: Joi.string(), // TODO limit to schema keys
  owner: User.schema.id,
  players: Joi.number().min(1).max(20),
  published_after: Joi.number(),
  search: Joi.string(),
});

const schemaPublish = Object.assign(schema, {
  published: schema.published.default(() => new Date(), 'current date'),
  tombstone: schema.tombstone.default(null),
});


exports.getById = function(id, callback) {

  Joi.validate(id, schema.id, (err, id) => {

    if (err) {
      return callback(err);
    }

    return Query.getId(table, id, callback);
  });
};

exports.search = function(userId, params, callback) {

  if (!params) {
    return callback(new Error("No search parameters given; requires at least one parameter"));
  }

  Joi.validate(params, schemaSearch, (err, params) => {

    if (err) {
      return callback(err);
    }

    let query = Squel.select()
      .from(table)
      .where('tombstone IS NULL');

    if (params.id) {
      query = query.where('id = ?', params.id);
    }

    if (params.owner) {
      query = query.where('userid = ?', params.owner);
    }

    // Require results to be published if we're not querying our own quests
    if (params.owner !== userId || userId == "") {
      query = query.where('published IS NOT NULL');
    }

    if (params.players) {
      query = query.where('minplayers <= ?', params.players)
                   .where('maxplayers >= ?', params.players);
    }

    if (params.search) {
      const search = '%' + params.search.toLowerCase() + '%';
      query = query.where(Squel.expr().and('LOWER(title) LIKE ?', search).or('LOWER(summary) LIKE ?', search));
    }

    if (params.published_after) {
      query = query.where("published > NOW() - '? seconds'::INTERVAL", params.published_after);
    }

    if (params.order) {
      query = query.order(params.order.substr(1), (params.order[0] === '+'));
    }

    const limit = Math.max(params.limit || 0, 100);
    query = query.limit(limit);
    Query.run(query, (err, results) => {

      if (err) {
        return callback(err);
      }

      const hasMore = results.length === limit ? token + results.length : false;
      return callback(null, results, hasMore);
    });
  });
};

function formatQuest(node, context) {
  // TODO: Dedupe this against to_markdown
  // Parse headers
  var result = {};

  var attrs = [
    "title",
    "summary",
    "author",
    "email",
    "url",
    "minplayers",
    "maxplayers",
    "mintimeminutes",
    "maxtimeminutes"
  ];

  for (var i = 0; i < attrs.length; i++) {
    var v = (node.attr(attrs[i])+'').trim();
    if (v) {
      var formatted_attr = attrs[i].replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });

      // TODO: Clean up this later
      if (v === 'minplayers' || v === 'maxplayers' || v === 'mintimeminutes' || v === 'maxtimeminutes') {
        v = parseInt(v);
      }

      result[attrs[i]] = v;
    }
  }
  return result;
}

function convertQuestXMLToMetadata(text) {
  var $ = Cheerio.load(text);
  return formatQuest($("quest"), {depth: 0});
}

exports.publish = function(userId, docId, xml, callback) {
// TODO: Validate XML

  if (!userId) {
    return callback(new Error('Invalid or missing User ID'));
  }

  if (!docId) {
    return callback(new Error('Invalid or missing Quest ID'));
  }

  if (!xml) {
    return callback('Could not publish - no xml data.');
  }

  const id = userId + '_' + docId;
  const cloudStorageData = {
    gcsname: userId + "/" + docId + "/" + Date.now() + ".xml",
    buffer: xml
  };

  // Run in parallel with the Datastore model.
  CloudStorage.upload(cloudStorageData, (err, data) => {
    if (err) {
      console.log(err);
    }
  });

  const meta = Object.assign({}, convertQuestXMLToMetadata(xml),
      {
        id: id,
        userid: userId,
        publishedurl: CloudStorage.getPublicUrl(cloudStorageData.gcsname),
      });

  Joi.validate(meta, schemaPublish, (err, meta) => {
    if (err) {
      return callback(err);
    }

    Query.getId(table, meta.id, (err, result) => {
      if (err) {
        if (err.code === 404) { // if this is a newly published quest, email us!
          const message = `Summary: ${meta.summary}. By ${meta.author}, for ${meta.minplayers} - ${meta.maxplayers} players.`;
          Mail.send('expedition+newquest@fabricate.io', 'New quest published: ' + meta.title, message, message, (err, result) => {});
        } else { // this is just for notifying us, so don't return error if it fails
          console.log(err);
        }
      }

      Query.upsert(table, meta, (err, result) => {
        return callback(err, id);
      });
    });
  });
};

exports.unpublish = function(userId, docId, callback) {

  if (!userId) {
    return callback(new Error('Invalid or missing User ID'));
  }

  if (!docId) {
    return callback(new Error('Invalid or missing Quest ID'));
  }

  const id = userId + '_' + docId;
  Query.deleteId(table, id, (err, result) => {
    return callback(err, id);
  });
};

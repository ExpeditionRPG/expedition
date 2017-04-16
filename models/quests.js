const Joi = require('joi');
const Squel = require('squel');
const Cheerio = require('cheerio');

const CloudStorage = require('../lib/cloudstorage');
const Mail = require('../mail');
const Query = require('./query');
const Feedback = require('./feedback');
const Schemas = require('./schemas');

const table = 'quests';


exports.getById = function(id, callback) {

  Joi.validate(id, Schemas.quests.id, (err, id) => {

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

  Joi.validate(params, Schemas.questsSearch, (err, params) => {

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

function convertQuestXMLToMetadata(text, callback) {
  const $ = Cheerio.load(text);
  const attribs = $("quest")[0].attribs;
  delete attribs['data-line'];
  Joi.validate(attribs, Schemas.quests, callback);
}

exports.publish = function(userId, id, xml, callback) {
// TODO: Validate XML

  if (!userId) {
    return callback(new Error('Invalid or missing User ID'));
  }

  if (!id) {
    return callback(new Error('Invalid or missing Quest Document ID'));
  }

  if (!xml) {
    return callback('Could not publish - no xml data.');
  }

  const cloudStorageData = {
    gcsname: userId + "/" + id + "/" + Date.now() + ".xml",
    buffer: xml
  };

  // Run in parallel with the Datastore model.
  CloudStorage.upload(cloudStorageData, (err, data) => {
    if (err) {
      console.log(err);
    }
  });

  convertQuestXMLToMetadata(xml, (err, result) => {
    if (err) {
      return callback(err);
    }

    const meta = Object.assign({}, result, {
      id: id,
      userid: userId,
      publishedurl: CloudStorage.getPublicUrl(cloudStorageData.gcsname),
    });

    Joi.validate(meta, Schemas.questsPublish, (err, meta) => {
      if (err) {
        return callback(err);
      }

      Query.getId(table, meta.id, (err, result) => {
        if (err) {
          if (err.code === 404) { // if this is a newly published quest, email us!
            const message = `Summary: ${meta.summary}. By ${meta.author}, for ${meta.minplayers} - ${meta.maxplayers} players.`;
            Mail.send('expedition+newquest@fabricate.io', 'New quest published: ' + meta.title, message, (err, result) => {});
          } else { // this is just for notifying us, so don't return error if it fails
            console.log(err);
          }
        }

        Query.upsert(table, meta, 'id', (err, result) => {
          return callback(err, id);
        });
      });
    });
  });
};

exports.unpublish = function(id, callback) {

  Joi.validate(id, Schemas.quests.id, (err, id) => {

    if (err) {
      return callback(err);
    }

    Query.deleteId(table, id, (err, result) => {
      return callback(err, id);
    });
  });
};

exports.updateRatings = function(id, callback) {
  Joi.validate(id, Schemas.quests.id, (err, id) => {
    if (err) {
      return callback(err);
    }

    Query.getId(table, id, (err, quest) => {
      if (err) {
        return callback(err);
      }

      Feedback.getRatingsByQuestId(id, (err, feedback) => {
        if (err) {
          return callback(err);
        }

        const ratings = feedback.map((feedback) => {
          return feedback.rating;
        });
        quest.ratingcount = ratings.length;
        quest.ratingavg = ratings.reduce((a, b) => { return a + b; }) / ratings.length;

        Query.upsert(table, quest, 'id', (err, result) => {
          return callback(err, id);
        });
      });
    });
  });
};

import Joi from 'joi'
import Query from './query'
import Feedback from './feedback'
import Schemas from './schemas'
import Cheerio from 'cheerio'

const Squel = require('squel');

import CloudStorage from '../lib/cloudstorage'
import Mail from '../mail'

const table = 'quests';


export function getById(id: string, callback: (e: Error, v: any)=>any) {

  Joi.validate(id, Schemas.quests.id, (err: Error, id: string) => {

    if (err) {
      return callback(err, null);
    }

    return Query.getId(table, id, callback);
  });
};

// TODO: SearchParams interface
export function search(userId: string, params: any, callback: (e: Error, results: any[], hasMore: boolean)=>any) {

  if (!params) {
    return callback(new Error('No search parameters given; requires at least one parameter'), null, false);
  }

  Joi.validate(params, Schemas.questsSearch, (err: Error, params: any) => {

    if (err) {
      return callback(err, null, false);
    }

    let query = Squel.select()
      .from(table)
      .where('tombstone IS NULL');

    if (params.id) {
      query = query.where('id = ?', params.id);
    }

    // Require results to be published if we're not querying our own quests
    if (params.owner !== userId || userId == "") {
      query = query.where('published IS NOT NULL');
    }

    if (params.players) {
      query = query.where('minplayers <= ?', params.players)
                   .where('maxplayers >= ?', params.players);
    }

    // DEPRECATED from app 6/10/17 (also in schemas.js)
    if (params.search) {
      const search = '%' + params.search.toLowerCase() + '%';
      query = query.where(Squel.expr().and('LOWER(title) LIKE ?', search).or('LOWER(summary) LIKE ?', search));
    }
    if (params.published_after) {
      query = query.where("published > NOW() - '? seconds'::INTERVAL", params.published_after);
    }

    if (params.text && params.text !== '') {
      const text = '%' + params.text.toLowerCase() + '%';
      query = query.where(Squel.expr().and('LOWER(title) LIKE ?', text).or('LOWER(summary) LIKE ?', text));
    }

    if (params.age) {
      query = query.where("published > NOW() - '? seconds'::INTERVAL", params.age);
    }

    if (params.mintimeminutes) {
      query = query.where('mintimeminutes >= ?', params.mintimeminutes);
    }

    if (params.maxtimeminutes) {
      query = query.where('maxtimeminutes <= ?', params.maxtimeminutes);
    }

    if (params.contentrating) {
      query = query.where('contentrating = ?', params.contentrating);
    }

    if (params.genre) {
      query = query.where('genre = ?', params.genre);
    }

    if (params.order) {
      if (params.order === '+ratingavg') {
        query = query.order(`
          CASE
            WHEN ratingcount < 5 THEN 0
            ELSE ratingavg
          END DESC NULLS LAST`, null);
        query = query.order(`
          CASE
            WHEN ratingcount < 5 THEN 0
            ELSE ratingavg
          END`, false);
      } else {
        query = query.order(params.order.substr(1), (params.order[0] === '+'));
      }
    }

    const limit = Math.max(params.limit || 0, 100);
    query = query.limit(limit);
    Query.run(query, (err: Error, results: any[]) => {
      if (err) {
        return callback(err, null, false);
      }
      const hasMore = (results.length === limit);
      return callback(null, results, hasMore);
    });
  });
};

function convertQuestXMLToMetadata(text: string, callback: (e: Error, result: any)=>any) {
  const $ = Cheerio.load(text);
  const attribs = $('quest')[0].attribs;
  delete attribs['data-line'];
  Joi.validate(attribs, Schemas.questsPublish, callback);
}

export function publish(userId: string, id: string, params: any, xml: string, callback: (e: Error, id: string)=>any) {
// TODO: Validate XML via crawler
  params = Joi.validate(params, {majorRelease: Joi.boolean()}).value;

  if (!userId) {
    return callback(new Error('Invalid or missing User ID'), null);
  }

  if (!id) {
    return callback(new Error('Invalid or missing Quest Document ID'), null);
  }

  if (!xml) {
    return callback(new Error('Could not publish - no xml data.'), null);
  }

  const cloudStorageData = {
    gcsname: userId + "/" + id + "/" + Date.now() + ".xml",
    buffer: xml
  };

  // Run in parallel with the Datastore model.
  CloudStorage.upload(cloudStorageData, (err: Error) => {
    if (err) {
      console.log(err);
    }
  });

  convertQuestXMLToMetadata(xml, (err: Error, result: any) => {
    if (err) {
      return callback(err, null);
    }

    const meta = Object.assign({}, result, {
      id: id,
      userid: userId,
      publishedurl: CloudStorage.getPublicUrl(cloudStorageData.gcsname),
    });

    Joi.validate(meta, Schemas.questsPublish, (err: Error, meta: any) => {
      if (err) {
        return callback(err, null);
      }

      Query.getId(table, meta.id, (err: Error, result) => {
        if (err) {
          if ((err as any).code === 404) { // if this is a newly published quest, email us!
            const message = `Summary: ${meta.summary}. By ${meta.author}, for ${meta.minplayers} - ${meta.maxplayers} players.`;
            Mail.send('expedition+newquest@fabricate.io', 'New quest published: ' + meta.title, message, (err: Error, result: any) => {});
          } else { // this is just for notifying us, so don't return error if it fails
            console.log(err);
          }
        }

        result = result || {}; // if no result, don't break on result. references

        meta.questversion = (result.questversion || 0) + 1;
        if (params.majorRelease) {
          meta.questversionlastmajor = meta.questversion;
        }

        Query.upsert(table, meta, 'id', (err: Error, result: any) => {
          return callback(err, id);
        });
      });
    });
  });
};

export function unpublish(id: string, callback: (e: Error, v: any)=>any) {

  Joi.validate(id, Schemas.quests.id, (err: Error, id: string) => {

    if (err) {
      return callback(err, null);
    }

    Query.deleteId(table, id, (err: Error, result: any) => {
      return callback(err, id);
    });
  });
};

export function updateRatings(id: string, callback: (e: Error, v: any)=>any) {
  Joi.validate(id, Schemas.quests.id, (err: Error, id: string) => {
    if (err) {
      return callback(err, null);
    }

    Query.getId(table, id, (err: Error, quest: any) => {
      if (err) {
        return callback(err, null);
      }

      Feedback.getRatingsByQuestId(id, (err: Error, feedback: any) => {
        if (err) {
          return callback(err, null);
        }

        const ratings = feedback.filter((feedback: any) => {
          return (feedback.questversion >= quest.questversionlastmajor);
        }).map((feedback: any) => {
          return feedback.rating;
        });
        quest.ratingcount = ratings.length;
        quest.ratingavg = ratings.reduce((a: number, b: number) => { return a + b; }) / ratings.length;
        Query.upsert(table, quest, 'id', (err: Error, result: any) => {
          return callback(err, quest);
        });
      });
    });
  });
};

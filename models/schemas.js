const Joi = require('joi');

const DATE_NOW = Joi.date().default(() => new Date(), 'current date');
const DATE_NULL = Joi.date().default(null).allow(null);
const EMAIL = Joi.string().email().max(255);
const ID_STRING = Joi.string().max(255);
const NAME = Joi.string().max(255);
const MIN_PLAYERS = 1;
const MAX_PLAYERS = 20;


const schemas = {};

schemas.quests = {
  id: ID_STRING, // google drive doc id
  publishedurl: Joi.string().uri().max(2048),
  userid: ID_STRING,
  author: NAME,
  contentrating: Joi.string(),
  email: EMAIL,
  familyfriendly: Joi.boolean(),
  genre: Joi.string(),
  maxplayers: Joi.number().min(MIN_PLAYERS).max(MAX_PLAYERS),
  maxtimeminutes: Joi.number().min(1),
  minplayers: Joi.number().min(MIN_PLAYERS).max(MAX_PLAYERS),
  mintimeminutes: Joi.number().min(1),
  ratingavg: Joi.number().min(1).max(5),
  ratingcount: Joi.number().min(0),
  summary: Joi.string().max(1024),
  title: Joi.string().max(255),
  url: Joi.string().max(2048), // Note: not required to be a URI because other parts of the code
                               // still want it to exclude http://

  // metadata
  created: Joi.date(),
  published: Joi.date(),
  tombstone: Joi.date().allow(null),
};

schemas.questsSearch = Object.assign(schemas.quests, {
  order: Joi.string(), // TODO limit to schemas keys
  owner: ID_STRING,
  players: Joi.number().min(MIN_PLAYERS).max(MAX_PLAYERS),
  published_after: Joi.number(),
  search: Joi.string(),
});

schemas.questsPublish = Object.assign(schemas.quests, {
  published: DATE_NOW,
  tombstone: DATE_NULL,
});


schemas.users = {
  id: ID_STRING,
  email: EMAIL,
  name: NAME,

  // metadata
  created: Joi.date(),
  lastLogin: Joi.date(),
  tombstone: Joi.date(),
};

schemas.usersUpsert = Object.assign(schemas.users, {
  lastLogin: DATE_NOW,
  tombstone: DATE_NULL,
});


schemas.feedback = {
  questid: ID_STRING,
  userid: ID_STRING,
  rating: Joi.number().min(1).max(5),
  text: Joi.string().max(2048),
  difficulty: Joi.string().max(32),
  email: EMAIL,
  name: NAME,
  platform: Joi.string().max(32),
  players: Joi.number().min(MIN_PLAYERS).max(MAX_PLAYERS),
  version: Joi.string().max(32),

  // metadata
  created: Joi.date(),
};

schemas.feedbackSubmit = Object.assign(schemas.feedback, {
  questid: schemas.feedback.questid.required(),
  userid: schemas.feedback.userid.required(),
  rating: schemas.feedback.rating.required(),
  created: DATE_NOW,
});

module.exports = schemas;

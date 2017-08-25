import {sequelize} from './schemas'
import {Sequelize} from "sequelize";

const Joi = require('joi');

const DATE_NOW = Joi.date().default(() => new Date(), 'current date');
const DATE_NULL = Joi.date().default(null).allow(null);
const EMAIL = Joi.string().email().max(255);
const ID_STRING = Joi.string().max(255);
const NAME = Joi.string().max(255);
const MIN_PLAYERS = 1;
const MAX_PLAYERS = 20;

const schemas: any = {};

// const results = Joi.validate(params, Schemas.questsSearch);
export questsSearch = {
  ...schemas.quests,
  order: Joi.string(), // TODO limit to schemas keys
  players: Joi.number().min(MIN_PLAYERS).max(MAX_PLAYERS),
  published_after: Joi.number(), // DEPRECATED 6/10/17
  search: Joi.string(), // DEPRECATED 6/10/17
  age: Joi.number().min(0),
  text: Joi.string().allow(''),
  mintimeminutes: schemas.quests.mintimeminutes,
  maxtimeminutes: schemas.quests.maxtimeminutes,
  contentrating: schemas.quests.contentrating,
  genre: schemas.quests.genre,
};

schemas.questsPublish = {
  ...schemas.quests,
  published: DATE_NOW,
  tombstone: DATE_NULL,
  majorRelease: Joi.boolean(),
};

schemas.feedbackSubmit = {
  ...schemas.feedback,
  questid: schemas.feedback.questid.required(),
  userid: schemas.feedback.userid.required(),
  rating: schemas.feedback.rating.required(),
  created: DATE_NOW,
};

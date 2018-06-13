const packageJson: any = require('../package.json');

export const NODE_ENV = (process && process.env && process.env.NODE_ENV) || 'dev';
export const API_HOST = (process && process.env && process.env.API_HOST) || 'http://betaapi.expeditiongame.com';
export const VERSION = packageJson.version;
export const METADATA_FIELDS = [
  'summary',
  'author',
  'email',
  'minplayers',
  'maxplayers',
  'mintimeminutes',
  'maxtimeminutes'
];
export const PARTITIONS = {
  PUBLIC: 'expedition-public',
  PRIVATE: 'expedition-private',
};
export const authSettings = {
  urlBase: API_HOST,
  apiKey: 'AIzaSyCgvf8qiaVoPE-F6ZGqX6LzukBftZ6fJr8',
  scopes: 'profile email',
  clientId: '545484140970-r95j0rmo8q1mefo0pko6l3v6p4s771ul.apps.googleusercontent.com',
};

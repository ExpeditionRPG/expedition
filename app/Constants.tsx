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
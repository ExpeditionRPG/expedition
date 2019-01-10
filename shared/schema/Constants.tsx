export function enumValues<T>(e: T): Array<T[keyof T]> {
  return Object.keys(e).map((k: keyof T) => e[k]);
}

export enum Difficulty {
  easy = 'EASY',
  normal = 'NORMAL',
  hard = 'HARD',
  impossible = 'IMPOSSIBLE',
}

export enum Partition {
  expeditionPrivate = 'expedition-private',
  expeditionPublic = 'expedition-public',
}

export enum Genre {
  comedy = 'Comedy',
  drama = 'Drama',
  horror = 'Horror',
  mystery = 'Mystery',
  romance = 'Romance',
  scifi = 'SciFi',
}

export enum Language {
  english = 'English',
  french = 'French',
  german = 'German',
  hungarian = 'Hungarian',
  italian = 'Italian',
  portuguese = 'Portuguese',
  romanian = 'Romanian',
  spanish = 'Spanish',
}

/* tslint:disable object-literal-sort-keys */

// Content rating options and their definitions, generally based on MPAA guidelines
export enum ContentRating {
  kidFriendly = 'Kid-friendly',
  teen = 'Teen',
  adult = 'Adult',
}
export interface ContentRatingDescription {
  summary: string;
  details: {
    [key: string]: string;
    drugs: string;
    language: string;
    nudity: string;
    violence: string;
  };
}

export const CONTENT_RATING_DESC: {[key in ContentRating]: ContentRatingDescription} = {
  [ContentRating.kidFriendly]: {
    summary:   'No drug use or nudity, very limited profanity, and no references to sex or detailed violence.',
    details: {
      drugs:   'No drug use allowed.',
      language:   'Only very limited profanity allowed, and no sexually-derived words.',
      nudity:   'No nudity allowed.',
      violence:   'No descriptions of violence allowed outside of game mechanics.',
    },
  },
  [ContentRating.teen]: {
    summary: 'Brief and limited violence and profanity. Potential non-sexual nudity and responsible drug use.',
    details: {
      drugs: 'May contain drug use, but not abuse.',
      language: 'May contain profanity except in a sexual context.',
      nudity: 'May contain non-sexual nudity.',
      violence: 'May contain brief, limited descriptions of violence.',
    },
  },
  [ContentRating.adult]: {
    summary: 'Mature (but not pornographic). Titles and descriptions must still be PG.',
    details: {
      drugs: 'Drugs allowed.',
      language: 'Profanity allowed.',
      nudity: 'Nudity allowed.',
      violence: 'Violence allowed.',
    },
  },
};

export enum Theme {
  base = 'base',
  horror = 'horror',
}

export const VERSION = (process && process.env && process.env.VERSION) || '0.0.1'; // Webpack
export const NODE_ENV = (process && process.env && process.env.NODE_ENV) || 'dev';
export const API_HOST = (process && process.env && process.env.API_HOST) || 'http://betaapi.expeditiongame.com';

export const AUTH_SETTINGS = {
  // Android: '545484140970-qrhcn069bbvae1mub2237h5k32mnp04k.apps.googleusercontent.com',
  // iOS: (REVERSE_CLIENT_ID) '545484140970-lgcbm3df469kscbngg2iof57muj3p588.apps.googleusercontent.com',
  API_KEY: 'AIzaSyCgvf8qiaVoPE-F6ZGqX6LzukBftZ6fJr8',
  CLIENT_ID: (process && process.env && process.env.OAUTH2_CLIENT_ID) || '545484140970-jq9jp7gdqdugil9qoapuualmkupigpdl.apps.googleusercontent.com',
  SCOPES: 'profile email',
  URL_BASE: API_HOST,
};

/* tslint:enable object-literal-sort-keys */

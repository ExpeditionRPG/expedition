export function enumValues<T extends object>(e: T): Array<T[keyof T]> {
  // Object.keys() is typed as string[]; the cast to `keyof T` is what makes the
  // lookup legal and is safe because the keys come from `e` itself.
  return (Object.keys(e) as Array<keyof T>).map(k => e[k]);
}

export enum Expansion {
  base = 'base',
  horror = 'horror',
  future = 'future',
  wyrmsgiants = 'wyrmsgiants',
  scarredlands = 'scarredlands',
}
export const CONTENT_SET_FULL_NAMES: { [key in Expansion]: string } = {
  [Expansion.base]: 'Expedition',
  [Expansion.horror]: 'The Horror',
  [Expansion.future]: 'The Future',
  [Expansion.wyrmsgiants]: 'Of Wyrms and Giants',
  [Expansion.scarredlands]: 'Scarred Lands',
};

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

export const CONTENT_RATING_DESC: {
  [key in ContentRating]: ContentRatingDescription;
} = {
  [ContentRating.kidFriendly]: {
    summary:
      'No drug use or nudity, very limited profanity, and no references to sex or detailed violence.',
    details: {
      drugs: 'No drug use allowed.',
      language:
        'Only very limited profanity allowed, and no sexually-derived words.',
      nudity: 'No nudity allowed.',
      violence:
        'No descriptions of violence allowed outside of game mechanics.',
    },
  },
  [ContentRating.teen]: {
    summary:
      'Brief and limited violence and profanity. Potential non-sexual nudity and responsible drug use.',
    details: {
      drugs: 'May contain drug use, but not abuse.',
      language: 'May contain profanity except in a sexual context.',
      nudity: 'May contain non-sexual nudity.',
      violence: 'May contain brief, limited descriptions of violence.',
    },
  },
  [ContentRating.adult]: {
    summary:
      'Mature (but not pornographic). Titles and descriptions must still be PG.',
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

// These four `process.env.X` reads must stay written out in full: webpack's
// DefinePlugin substitutes the whole `process.env.X` member expression for a
// string literal at build time, and only recognises it spelled exactly this
// way. Every key read here is therefore defined in shared/webpack.shared.js.
//
// They used to be guarded as `(process && process.env && process.env.X)`.
// Webpack 4 injected a `process` mock so the bare identifier resolved; webpack
// 5 does not, DefinePlugin leaves a bare `process` alone, and the module threw
// `ReferenceError: process is not defined` before React could mount -- a blank
// page for app, admin and quests. A `typeof process !== 'undefined'` guard
// would be worse than useless: it is false in a browser, so the whole `&&`
// chain would short-circuit and every value would silently fall back to the
// defaults below, discarding what DefinePlugin substituted.
export const VERSION = process.env.VERSION || '0.0.1';
// Deployment channel is independent of the browser libraries' build mode.
export const NODE_ENV =
  process.env.EXPEDITION_ENV || process.env.NODE_ENV || 'dev';
export const API_HOST =
  process.env.API_HOST || 'https://betaapi.expeditiongame.com';

export const AUTH_SETTINGS = {
  // Android: '545484140970-qrhcn069bbvae1mub2237h5k32mnp04k.apps.googleusercontent.com',
  // iOS: (REVERSE_CLIENT_ID) '545484140970-lgcbm3df469kscbngg2iof57muj3p588.apps.googleusercontent.com',
  API_KEY: 'AIzaSyCgvf8qiaVoPE-F6ZGqX6LzukBftZ6fJr8',
  CLIENT_ID:
    process.env.OAUTH2_CLIENT_ID ||
    '545484140970-jq9jp7gdqdugil9qoapuualmkupigpdl.apps.googleusercontent.com',
  SCOPES: 'profile email',
  URL_BASE: API_HOST,
};

/* tslint:enable object-literal-sort-keys */

export enum Badge {
  backer1 = 'backer1',
  backer2 = 'backer2',
  backer3 = 'backer3',
}
export const BADGE_DESC: { [key in Badge]: string } = {
  [Badge.backer1]: 'Backed the first Expedition Kickstarter!',
  [Badge.backer2]: 'Backed the second Expedition Kickstarter!',
  [Badge.backer3]: 'Backed the third Expedition Kickstarter!',
};

declare var window:any;

export const authSettings = {
  urlBase: 'https://quests.expeditiongame.com',
  // urlBase: 'http://devquests.expeditiongame.com',
  // urlBase: 'http://localhost:8080',
  apiKey: 'AIzaSyCgvf8qiaVoPE-F6ZGqX6LzukBftZ6fJr8',
  scopes: 'profile',
  // web:
  clientId: '545484140970-r95j0rmo8q1mefo0pko6l3v6p4s771ul.apps.googleusercontent.com',
  // iOS: (REVERSE_CLIENT_ID)
  // clientId: '545484140970-lgcbm3df469kscbngg2iof57muj3p588.apps.googleusercontent.com',
  // Android:
  // 545484140970-qrhcn069bbvae1mub2237h5k32mnp04k.apps.googleusercontent.com
};

export const MAX_ADVENTURER_HEALTH = 12;
export const MIN_FEEDBACK_LENGTH = 16;
export const SUMMARY_MAX_LENGTH = 140; // length of a tweet

export const URLS = {
  android: 'https://play.google.com/store/apps/details?id=io.fabricate.expedition',
  feedbackBase: 'http://www.expeditiongame.com/contact/?utm_source=app&utm_medium=',
  ios: 'https://itunes.apple.com/us/app/expedition-roleplaying-card/id1085063478?ls=1&mt=8',
};

export const VIBRATION_SHORT_MS = 30; // for navigation / card changes
export const VIBRATION_LONG_MS = 400; // for unique events, like start of the timer
export const NAVIGATION_DEBOUNCE_MS = 600;

export const REGEX = {
  HTML_TAG: /<(\w|(\/\w))(.|\n)*?>/igm,
};

export const PLAYTIME_MINUTES_BUCKETS = [20, 30, 45, 60, 90, 120];

export type GenreType = 'Comedy' | 'Drama' | 'Horror' | 'Mystery' | 'Romance';
export const GENRES: GenreType[] = [
  'Comedy',
  'Drama',
  'Horror',
  'Mystery',
  'Romance'
];

// Content rating options and their definitions, generally based on MPAA guidelines
export type ContentRatingLabelType = 'Everyone' | 'Teen' | 'Adult';
export type ContentRatingType = {[key: string]: {[key: string]: string}};
export const CONTENT_RATINGS: ContentRatingType = {
  Everyone: {
    violence: 'No descriptions of violence allowed outside of combat mechanics.',
    language: 'Only very limited profanity allowed, and no sexually-derived words.',
    drugs: 'No drug use allowed.',
    nudity: 'No nudity allowed.',
  },
  Teen: {
    violence: 'May contain brief, limited descriptions of violence.',
    language: 'May contain profanity except in a sexual context.',
    drugs: 'May contain drug use, but not abuse.',
    nudity: 'May contain non-sexual nudity.',
  },
  Adult: {
    violence: 'All violence allowed.',
    language: 'All profanity allowed.',
    drugs: 'All drugs allowed.',
    nudity: 'All nudity allowed.',
  },
};

// converts a number to the English representation of the word
// Note: for numbers outside of 0 and 10, standard to just output the numeric form
export function numberToWord(input: number): string {
  switch (input) {
    case 0: return 'zero';
    case 1: return 'one';
    case 2: return 'two';
    case 3: return 'three';
    case 4: return 'four';
    case 5: return 'five';
    case 6: return 'six';
    case 7: return 'seven';
    case 8: return 'eight';
    case 9: return 'nine';
    case 10: return 'ten';
    default: return input.toString();
  }
}

// capitalize the first letter in the provided string
export function capitalizeFirstLetter(input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

// return a random property from the provided object
export function randomPropertyValue(obj: any): any {
  const keys = Object.keys(obj);
  return obj[ keys[ Math.floor(keys.length * Math.random()) ] ];
};

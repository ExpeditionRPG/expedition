declare var window:any;
export const NODE_ENV = (process && process.env && process.env.NODE_ENV) || 'dev';
export const API_HOST = (process && process.env && process.env.API_HOST) || 'http://betaapi.expeditiongame.com';
export const authSettings = {
  urlBase: API_HOST,
  // urlBase: 'https://api.expeditiongame.com',
  // urlBase: 'http://betaapi.expeditiongame.com',
  // urlBase: 'http://localhost:8081',
  apiKey: 'AIzaSyCgvf8qiaVoPE-F6ZGqX6LzukBftZ6fJr8',
  scopes: 'profile email',
  // web:
  clientId: '545484140970-r95j0rmo8q1mefo0pko6l3v6p4s771ul.apps.googleusercontent.com',
  // iOS: (REVERSE_CLIENT_ID)
  // clientId: '545484140970-lgcbm3df469kscbngg2iof57muj3p588.apps.googleusercontent.com',
  // Android:
  // 545484140970-qrhcn069bbvae1mub2237h5k32mnp04k.apps.googleusercontent.com
};

const splitURL = API_HOST.split('/');
export const remotePlaySettings = {
  newSessionURI: API_HOST + '/remoteplay/v1/new_session',
  connectURI: API_HOST + '/remoteplay/v1/connect',
  firstLoadURI: API_HOST + '/remoteplay/v1/user',
  websocketSession: 'ws://' + splitURL[splitURL.length-1] + '/ws/remoteplay/v1/session',
};

export const MAX_ADVENTURER_HEALTH = 12;
export const MIN_FEEDBACK_LENGTH = 16;
export const SUMMARY_MAX_LENGTH = 140; // length of a tweet

export const URLS = {
  android: 'https://play.google.com/store/apps/details?id=io.fabricate.expedition',
  feedbackBase: 'http://www.expeditiongame.com/contact/?utm_source=app&utm_medium=',
  ios: 'https://itunes.apple.com/us/app/expedition-roleplaying-card/id1085063478?ls=1&mt=8',
  questCreator: 'https://quests.expeditiongame.com/?utm_source=app',
};

export const CARD_TRANSITION_ANIMATION_MS = 300;
export const VIBRATION_SHORT_MS = 30; // for navigation / card changes
export const VIBRATION_LONG_MS = 400; // for unique events, like start of the timer
export const NAVIGATION_DEBOUNCE_MS = 600;
export const DOUBLE_TAP_MS = 500; // Maximum ms between tap / clicks to count as a double click
export const AUDIO_COMMAND_DEBOUNCE_MS = 300;
export const MUSIC_INTENSITY_MAX = 36;

export const PLAYTIME_MINUTES_BUCKETS = [20, 30, 45, 60, 90, 120];

// Based on 4 players, scaling up / down on a curve
// since a bit more or less damage makes a huge difference in # of rounds survivable
export const PLAYER_DAMAGE_MULT: {[key: number]: number} = {
  1: 0.5,
  2: 0.5,
  3: 0.8,
  4: 1,
  5: 1.1,
  6: 1.2,
};

// Give solo players 2x time since they're controlling two adventurers
export const PLAYER_TIME_MULT: {[key: number]: number} = {
  1: 2,
  2: 1,
  3: 1,
  4: 1,
  5: 1,
  6: 1,
};

export const COMBAT_DIFFICULTY: {[key: string]: any} = {
  EASY: {
    surgePeriod: 4,
    damageMultiplier: 0.7,
  },
  NORMAL: {
    surgePeriod: 3,
    damageMultiplier: 1.0,
  },
  HARD: {
    surgePeriod: 3,
    damageMultiplier: 1.2,
  },
  IMPOSSIBLE: {
    surgePeriod: 2,
    damageMultiplier: 1.4,
  },
};

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
export interface ContentRatingType {
  summary: string;
  details: {[key: string]: string};
}
export const CONTENT_RATINGS: {[key: string]: ContentRatingType} = {
  'Kid-friendly': {
    summary: 'No drug use or nudity, very limited profanity, and no references to sex or detailed violence.',
    details: {
      violence: 'No descriptions of violence allowed outside of combat mechanics.',
      language: 'Only very limited profanity allowed, and no sexually-derived words.',
      drugs: 'No drug use allowed.',
      nudity: 'No nudity allowed.',
    },
  },
  'Teen': {
    summary: 'Brief and limited violence and profanity. Potential non-sexual nudity and responsible drug use.',
    details: {
      violence: 'May contain brief, limited descriptions of violence.',
      language: 'May contain profanity except in a sexual context.',
      drugs: 'May contain drug use, but not abuse.',
      nudity: 'May contain non-sexual nudity.',
    },
  },
  'Adult': {
    summary: 'Any level of violence, profanity, drug use, and sexuality.',
    details: {
      violence: 'All violence allowed.',
      language: 'All profanity allowed.',
      drugs: 'All drugs allowed.',
      nudity: 'All nudity allowed.',
    },
  },
};

// A slight variation on the cubehelix pattern. This contains 6 categories,
// which is convenient for e.g. displaying 6 distinct character icons.
// https://jiffyclub.github.io/palettable/cubehelix/
// https://github.com/jiffyclub/palettable/blob/29ca166e8eb81797a5417d637f8d0b4901d4dbd0/palettable/cubehelix/cubehelix.py
export const COLORBLIND_FRIENDLY_PALETTE = [
  '#182044',
  '#0e5e4a',
  '#507d23',
  '#be7555',
  '#db8acb',
  '#bfc9fb',
];

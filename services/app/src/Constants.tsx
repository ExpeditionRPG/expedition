import {API_HOST, AUTH_SETTINGS as AUTH_SETTINGS_BASE, NODE_ENV, Partition} from 'shared/schema/Constants';
import {Quest} from 'shared/schema/Quests';

export const AUTH_SETTINGS = {
  ...AUTH_SETTINGS_BASE,
  RAVEN: 'https://990df74f1b58424395ec3d3ec6f79b42@sentry.io/420182',
  STRIPE: (NODE_ENV === 'production') ? 'pk_live_vcpOgs95UFKNV0kYOwj9JWPp' : 'pk_test_8SATEnwfIx0U2vkomn04kSou',
};

const splitURL = API_HOST.split('/');
export const MULTIPLAYER_SETTINGS = {
  connectURI: API_HOST + '/multiplayer/v1/connect',
  firstLoadURI: API_HOST + '/multiplayer/v1/user',
  newSessionURI: API_HOST + '/multiplayer/v1/new_session',
  websocketSession: ((NODE_ENV === 'production') ? 'wss://' : 'ws://') + splitURL[splitURL.length - 1] + '/ws/multiplayer/v1/session',
};

const EPOCH = new Date('2017-01-10'); // The date Expedition V1 shipped
export const BUNDLED_QUESTS: Quest[] = [ // TODO - actually put GM quests here.
  new Quest({
    id: '0BzrQOdaJcH9MU3Z4YnE2Qi1oZGs',
    partition: Partition.expeditionPublic,
    theme: 'base',
    official: true,
    title: 'Oust Albanus',
    summary: 'Your party encounters a smelly situation.',
    author: 'Scott Martin',
    publishedurl: 'quests/oust_albanus.xml',
    minplayers: 1,
    maxplayers: 6,
    mintimeminutes: 20,
    maxtimeminutes: 40,
    genre: 'Comedy',
    contentrating: 'Kid-friendly',
    language: 'English',
    created: EPOCH,
    published: EPOCH,
  }),
  new Quest({
    id: '0B7K9abSH1xEOUUR1Z0lncm9NRjQ',
    partition: Partition.expeditionPublic,
    theme: 'base',
    official: true,
    title: 'Dungeon Crawl',
    summary: 'How deep can you delve?',
    author: 'Todd Medema',
    publishedurl: 'quests/dungeon_crawl.xml',
    minplayers: 1,
    maxplayers: 6,
    mintimeminutes: 20,
    maxtimeminutes: 60,
    genre: 'Drama',
    contentrating: 'Kid-friendly',
    language: 'English',
    created: EPOCH,
    published: EPOCH,
  }),
  new Quest({
    id: '0B7K9abSH1xEORjdkMWtTY3ZtNGs',
    partition: Partition.expeditionPublic,
    theme: 'base',
    official: true,
    title: 'Mistress Malaise',
    summary: 'Mystery, Misfortune, and a Mistress.',
    author: 'Scott Martin',
    publishedurl: 'quests/mistress_malaise.xml',
    minplayers: 1,
    maxplayers: 6,
    mintimeminutes: 30,
    maxtimeminutes: 60,
    genre: 'Drama',
    contentrating: 'Kid-friendly',
    language: 'English',
    created: EPOCH,
    published: EPOCH,
  }),
];

export const GM_QUESTS: Quest[] = [
  new Quest({
    id: '1_SDISJtbeCMzUzNJPPYYagofuLRDNG3W',
    partition: 'expedition-public',
    theme: 'base',
    official: true,
    title: 'Custom Combat',
    summary: 'Tell your own story, and let the app run combat.',
    author: 'Expedition Team',
    publishedurl: 'quests/custom_combat.xml',
    minplayers: 1,
    maxplayers: 6,
    mintimeminutes: 5,
    maxtimeminutes: 60,
    genre: 'Mystery',
    contentrating: 'Kid-friendly',
    language: 'English',
    expansionhorror: false,
    expansionfuture: false,
    requirespenpaper: false,
    created: EPOCH,
    published: EPOCH,
  }),
  new Quest({
    id: '1I9JM_Kabh5zdw3S-ipVOYj1oSh_Hbdvc',
    partition: Partition.expeditionPublic,
    theme: 'base',
    official: true,
    title: 'The Siege: New GMs',
    summary: 'Prompts and ideas for new GMs, with a fantasy theme.',
    author: 'Greg Miller',
    publishedurl: 'quests/the_siege.xml',
    minplayers: 1,
    maxplayers: 6,
    mintimeminutes: 30,
    maxtimeminutes: 999,
    genre: 'Drama',
    contentrating: 'Kid-friendly',
    language: 'English',
    expansionhorror: false,
    expansionfuture: false,
    requirespenpaper: true,
    created: EPOCH,
    published: EPOCH,
  }),
  new Quest({
    id: '1LCF1rtPEgcHIx7cqHaIbgs-PGASHfXCk',
    partition: Partition.expeditionPublic,
    theme: 'base',
    official: true,
    title: 'Fantasy Arc: Experienced GMs',
    summary: 'Prompts and ideas for experienced GMs, with a fantasy theme.',
    author: 'Greg Miller',
    publishedurl: 'quests/fantasy_arc.xml',
    minplayers: 1,
    maxplayers: 6,
    mintimeminutes: 40,
    maxtimeminutes: 999,
    genre: 'Drama',
    contentrating: 'Kid-friendly',
    language: 'English',
    expansionhorror: false,
    expansionfuture: false,
    requirespenpaper: true,
    created: EPOCH,
    published: EPOCH,
  }),
  new Quest({
    id: '1tgIk4_lnxqgWy5WQUId68XMQnfn1Be5s',
    partition: Partition.expeditionPublic,
    theme: 'base',
    official: true,
    title: 'A Shiny Score',
    summary: 'Guide your party through a space heist.',
    author: 'Greg Miller',
    publishedurl: 'quests/a_shiny_score.xml',
    minplayers: 1,
    maxplayers: 6,
    mintimeminutes: 30,
    maxtimeminutes: 180,
    genre: 'SciFi',
    contentrating: 'Teen',
    language: 'English',
    expansionhorror: true,
    expansionfuture: true,
    requirespenpaper: true,
    created: EPOCH,
    published: EPOCH,
  }),
  new Quest({
    id: '1kssfItnSzYRhaI6p-ASGb1pS0aCOIuVr',
    partition: Partition.expeditionPublic,
    theme: 'base',
    official: true,
    title: 'Future Inspirations',
    summary: 'A general framework for telling your own stories with The Future. (for more advanced GM\'s)',
    author: 'Greg Miller',
    publishedurl: 'quests/future_inspirations.xml',
    minplayers: 1,
    maxplayers: 6,
    mintimeminutes: 30,
    maxtimeminutes: 180,
    genre: 'SciFi',
    contentrating: 'Teen',
    language: 'English',
    expansionhorror: true,
    expansionfuture: true,
    requirespenpaper: true,
    created: EPOCH,
    published: EPOCH,
  }),
];
export const TUTORIAL_QUESTS: Quest[] = [ // Featured quest ids generated from publishing, but don't leave them published!
  new Quest({
    id: '0B7K9abSH1xEOeEZSVVMwNHNqaFE',
    partition: Partition.expeditionPublic,
    theme: 'base',
    official: true,
    title: 'Learning to Adventure',
    summary: 'Your first adventure.',
    author: 'Todd Medema',
    publishedurl: 'quests/learning_to_adventure.xml',
    minplayers: 1,
    maxplayers: 6,
    mintimeminutes: 20,
    maxtimeminutes: 30,
    genre: 'Drama',
    contentrating: 'Kid-friendly',
    language: 'English',
    created: EPOCH,
    published: EPOCH,
  }),
  new Quest({
    id: '0B7K9abSH1xEOWVpEV1JGWDFtWmc',
    partition: Partition.expeditionPublic,
    theme: 'horror',
    official: true,
    title: 'Learning 2: The Horror',
    summary: 'Your first adventure continues with Expedition: The Horror.',
    author: 'Todd Medema',
    publishedurl: 'quests/learning_to_adventure_2_the_horror.xml',
    minplayers: 1,
    maxplayers: 6,
    mintimeminutes: 20,
    maxtimeminutes: 40,
    genre: 'Drama',
    contentrating: 'Kid-friendly',
    language: 'English',
    expansionhorror: true,
    created: EPOCH,
    published: EPOCH,
  }),
  new Quest({
    id: '1kWPBHWA6L9bViU1SqLd6WOw6hNMvtedI',
    partition: Partition.expeditionPublic,
    theme: 'base',
    official: true,
    title: 'Learning 3: The Future',
    summary: 'Your first adventure continues into The Future.',
    author: 'Greg Miller',
    publishedurl: 'quests/learning_to_adventure_3_the_future.xml',
    expansionhorror: true,
    expansionfuture: true,
    minplayers: 1,
    maxplayers: 6,
    mintimeminutes: 20,
    maxtimeminutes: 50,
    genre: 'Drama',
    contentrating: 'Kid-friendly',
    language: 'English',
    created: EPOCH,
    published: EPOCH,
  }),
];

if (NODE_ENV === 'dev') {
  TUTORIAL_QUESTS.unshift(new Quest({
    id: '0B7K9abSH1xEOV3M2bTVMdWc4NVk',
    partition: 'expedition-private',
    title: 'Test quest',
    summary: 'DEV',
    author: 'DEV',
    publishedurl: 'quests/test_quest.xml',
    expansionhorror: false,
    expansionfuture: false,
    minplayers: 1,
    maxplayers: 6,
    mintimeminutes: 20,
    maxtimeminutes: 40,
    genre: 'Drama',
    contentrating: 'Kid-friendly',
    language: 'English',
    created: EPOCH,
    published: EPOCH,
  }));
}

export const MAX_ADVENTURERS = 6;
export const MAX_ADVENTURER_HEALTH = 12;
export const MIN_FEEDBACK_LENGTH = 16;

export const UNSUPPORTED_BROWSERS = /^(.*amazon silk.*)|(.*(iphone|ipad|ipod|ios) os 9_.*)$/i;

export const URLS = {
  CODE: 'https://github.com/ExpeditionRPG/expedition',
  WEBSITE: 'http://expeditiongame.com',
  PRIVACY_POLICY: 'https://expeditiongame.com/privacy',
  QUEST_CREATOR: 'https://quests.expeditiongame.com/?utm_source=app',
  // lowercase to match lowercase platform names
  android: 'https://play.google.com/store/apps/details?id=io.fabricate.expedition',
  ios: 'https://itunes.apple.com/us/app/expedition-roleplaying-card/id1085063478?ls=1&mt=8',
  web: 'http://expeditiongame.com/app',
};

export const INIT_DELAY = {
  LOAD_AUDIO_MILLIS: 2000,
  SILENT_LOGIN_MILLIS: 1000,
  FREE_STORAGE_MILLIS: 3000,
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

/* tslint:disable:object-literal-sort-keys */
export const COMBAT_DIFFICULTY: {[key: string]: any} = {
  EASY: {
    damageMultiplier: 0.7,
    maxRoundDamage: 4,
    surgePeriod: 4,
  },
  NORMAL: {
    damageMultiplier: 0.9,
    maxRoundDamage: 5,
    surgePeriod: 3,
  },
  HARD: {
    damageMultiplier: 1.2,
    maxRoundDamage: 6,
    surgePeriod: 3,
  },
  IMPOSSIBLE: {
    damageMultiplier: 1.3,
    maxRoundDamage: 7,
    surgePeriod: 2,
  },
};
/* tslint:enable:object-literal-sort-keys */

export const SPLASH_SCREEN_TIPS = [
  `Tip: Change which expansions you're playing with in settings.`,
  `Tip: Enemies deal more damage over time, so try to win quickly!`,
  `Make sure to rate quests after you play them!`,
  `You can submit feedback at any time from the top right menu.`,
  `Write your own quests at quests.expeditiongame.com!`,
  `Tip: Turn your phone off silent to enjoy haptic vibration feedback.`,
  `Tip: Searching quests only shows quests for the number of players you select.`,
  `Did you know you can use the back of enemy cards as custom enemies?`,
  `To avoid untimely interruptions, make sure you have a phone charger handy!`,
  `Expedition has online multiplayer built into the app!`,
  `Save your progress in a quest via the top right menu. Saved games are available offline!`,
];

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

export interface MusicDefinition {
  baselineInstruments: string[];
  bpm: number;
  directory: string;
  instruments: string[];
  loopMs: number;
  maxIntensity: number;
  minIntensity: number;
  peakingInstrument: string;
  variants: number;
}

export const MUSIC_DEFINITIONS: {[key: string]: {[key: string]: MusicDefinition}} = {
  combat: {
    heavy: {
      baselineInstruments: ['Drums', 'LowStrings', 'LowBrass', 'HighStrings'],
      bpm: 140,
      directory: 'combat/heavy/',
      instruments: ['Drums', 'LowStrings', 'LowBrass', 'HighStrings', 'HighBrass'],
      loopMs: 13712,
      maxIntensity: MUSIC_INTENSITY_MAX,
      minIntensity: 12,
      peakingInstrument: 'HighBrass',
      variants: 6,
    },
    light: {
      // peakingInstrument always at the end
      baselineInstruments: ['Drums', 'LowStrings', 'LowBrass', 'HighStrings'],
      bpm: 120,
      directory: 'combat/light/',
      instruments: ['Drums', 'LowStrings', 'LowBrass', 'HighStrings', 'HighBrass'],
      loopMs: 8000,
      maxIntensity: 24,
      minIntensity: 0,
      peakingInstrument: 'HighBrass',
      variants: 12,
    },
  },
};

export const MUSIC_FADE_SECONDS = 1.5;

export const NAV_CARDS = ['SEARCH_CARD', 'TUTORIAL_QUESTS', 'GM_CARD', 'SAVED_QUESTS', 'QUEST_HISTORY'];
export const NAV_CARD_STORAGE_KEY = 'nav_card';

export enum CombatPhase {
  drawEnemies = 'DRAW_ENEMIES',
  prepare = 'PREPARE',
  timer = 'TIMER', // Timer must be separate to allow skip of timer during onReturn.
  surge = 'SURGE',
  resolveAbilities = 'RESOLVE_ABILITIES',
  resolveDamage = 'RESOLVE_DAMAGE',
  victory = 'VICTORY',
  defeat = 'DEFEAT',
  midCombatRoleplay = 'MID_COMBAT_ROLEPLAY',
  midCombatDecision = 'MID_COMBAT_DECISION',
  midCombatDecisionTimer = 'MID_COMBAT_DECISION_TIMER',
}

export enum DecisionPhase {
  prepare = 'PREPARE_DECISION',
  timer = 'DECISION_TIMER',
  resolve = 'RESOLVE_DECISION',
}

export type DifficultyType = 'EASY' | 'NORMAL' | 'HARD' | 'IMPOSSIBLE';
export const DIFFICULTIES: DifficultyType[] = [
  'EASY',
  'NORMAL',
  'HARD',
  'IMPOSSIBLE',
];

export type PartitionType = 'expedition-private' | 'expedition-public';
export const PRIVATE_PARTITION = 'expedition-private';
export const PUBLIC_PARTITION = 'expedition-public';
export const PARTITIONS: PartitionType[] = [PRIVATE_PARTITION, PUBLIC_PARTITION];

export type GenreType = 'Comedy' | 'Drama' | 'Horror' | 'Mystery' | 'Romance';
export const GENRES: GenreType[] = [
  'Comedy',
  'Drama',
  'Horror',
  'Mystery',
  'Romance',
];

export type LanguageType = 'English' | 'French' | 'German' | 'Italian' | 'Portuguese' | 'Romanian' | 'Spanish';
export const LANGUAGES: LanguageType[] = [
  'English',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Romanian',
  'Spanish',
];

/* tslint:disable object-literal-sort-keys */

// Content rating options and their definitions, generally based on MPAA guidelines
export type ContentRatingLabelType = 'Kid-friendly' | 'Teen' | 'Adult';
export const CONTENT_RATINGS: ContentRatingLabelType[] = [
  'Kid-friendly',
  'Teen',
  'Adult',
];
export interface ContentRatingType {
  summary: string;
  details: {
    [key: string]: string;
    drugs: string;
    language: string;
    nudity: string;
    violence: string;
  };
}
export const CONTENT_RATING_DESC: {[key: string]: ContentRatingType} = {
  'Kid-friendly': {
    summary: 'No drug use or nudity, very limited profanity, and no references to sex or detailed violence.',
    details: {
      drugs: 'No drug use allowed.',
      language: 'Only very limited profanity allowed, and no sexually-derived words.',
      nudity: 'No nudity allowed.',
      violence: 'No descriptions of violence allowed outside of game mechanics.',
    },
  },
  'Teen': {
    summary: 'Brief and limited violence and profanity. Potential non-sexual nudity and responsible drug use.',
    details: {
      drugs: 'May contain drug use, but not abuse.',
      language: 'May contain profanity except in a sexual context.',
      nudity: 'May contain non-sexual nudity.',
      violence: 'May contain brief, limited descriptions of violence.',
    },
  },
  'Adult': {
    summary: 'Mature (but not pornographic). Titles and descriptions must still be PG.',
    details: {
      drugs: 'Drugs allowed.',
      language: 'Profanity allowed.',
      nudity: 'Nudity allowed.',
      violence: 'Violence allowed.',
    },
  },
};

export type ThemeType = 'base' | 'horror';
export const THEMES: ThemeType[] = [
  'base',
  'horror',
];

/* tslint:enable object-literal-sort-keys */

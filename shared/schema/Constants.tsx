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

// Content rating options and their definitions, generally based on MPAA guidelines
export type ContentRatingLabelType = 'Kid-friendly' | 'Teen' | 'Adult';
export const CONTENT_RATINGS: ContentRatingLabelType[] = [
  'Kid-friendly',
  'Teen',
  'Adult',
];
export type ContentRatingType = {
  summary: string;
  details: {
    [key: string]: string;
    violence: string;
    language: string;
    drugs: string;
    nudity: string;
  }
}
export const CONTENT_RATING_DESC: {[key: string]: ContentRatingType} = {
  'Kid-friendly': {
    summary: 'No drug use or nudity, very limited profanity, and no references to sex or detailed violence.',
    details: {
      violence: 'No descriptions of violence allowed outside of game mechanics.',
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
    summary: 'Mature (but not pornographic) use of violence, profanity, drugs, and sexuality. Titles and descriptions must still be PG.',
    details: {
      violence: 'Violence allowed.',
      language: 'Profanity allowed.',
      drugs: 'Drugs allowed.',
      nudity: 'Nudity allowed.',
    },
  },
};

export type ThemeType = 'base' | 'horror';
export const THEMES: ThemeType[] = [
  'base',
  'horror',
];

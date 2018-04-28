export type DifficultyType = 'EASY' | 'NORMAL' | 'HARD' | 'IMPOSSIBLE';
export const DIFFICULTIES: DifficultyType[] = ['EASY','NORMAL','HARD', 'IMPOSSIBLE'];

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
  'Romance'
];

export type LanguageType = 'English' | 'French' | 'German' | 'Italian' | 'Portuguese' | 'Spanish';
export const LANGUAGES: LanguageType[] = [
  'English',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Spanish'
];

// Content rating options and their definitions, generally based on MPAA guidelines
export type ContentRatingType = 'Everyone' | 'Teen' | 'Adult';
export const CONTENT_RATINGS: ContentRatingType[] = [
  'Everyone',
  'Teen',
  'Adult',
];

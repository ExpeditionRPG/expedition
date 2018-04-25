import {SchemaBase, field, copyAndUnsetDefaults, NOW, PLACEHOLDER_DATE} from './SchemaBase'

export const PRIVATE_PARTITION = 'expedition-private';
export const PUBLIC_PARTITION = 'expedition-public';

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
]

export class Quest extends SchemaBase {
  static create(fields: Partial<Quest>) {
    return super.initialize(this, fields);
  }

  constructor(fields: Partial<Quest>) {
    super(fields);
  }

  withoutDefaults() {
    return copyAndUnsetDefaults(Quest, this);
  }

  @field({
    primaryKey: true,
    allowNull: false,
    maxLength: 32,
    valid: [PRIVATE_PARTITION, PUBLIC_PARTITION],
  }) partition: string;

  @field({
    primaryKey: true,
    allowNull: false,
    maxLength: 255,
  }) id: string;

  @field({
    default: 1,
  }) questversion: number;

  @field({
    default: 1,
  }) questversionlastmajor: number;

  @field({
    maxLength: 128,
    default: '',
  }) engineversion: string;

  @field({
    maxLength: 2048,
    default: '',
  }) publishedurl: string;

  @field({
    maxLength: 255,
    default: '',
  }) userid: string;

  @field({
    maxLength: 255,
    default: '',
  }) author: string;

  @field({
    maxLength: 255,
    default: '',
  }) email: string;

  @field({
    default: 6,
  }) maxplayers: number;

  @field({
    default: 90,
  }) maxtimeminutes: number;

  @field({
    default: 1,
  }) minplayers: number;

  @field({
    default: 0,
  }) mintimeminutes: number;

  @field({
    maxLength: 1024,
    default: '',
  }) summary: string;

  @field({
    maxLength: 255,
    default: '',
  }) title: string;

  @field({
    maxLength: 2048,
    default: '',
  }) url: string;

  @field({
    default: false,
  }) familyfriendly: boolean;

  @field({
    default: 0,
    extra: 'DECIMAL_4_2',
  }) ratingavg: number;

  @field({
    default: 0,
  }) ratingcount: number;

  @field({
    valid: GENRES,
    maxLength: 128,
    default: '',
  }) genre: string;

  @field({
    valid: CONTENT_RATINGS,
    maxLength: 128,
    default: '',
  }) contentrating: string;

  @field({
    default: NOW,
  }) created: Date;

  @field({
    default: NOW,
  }) published: Date;

  @field({
    allowNull: true,
    default: PLACEHOLDER_DATE,
  }) tombstone: Date;

  @field({
    default: false,
  }) expansionhorror: boolean;

  @field({
    valid: LANGUAGES,
    maxLength: 128,
    default: 'English',
  }) language: string;
}

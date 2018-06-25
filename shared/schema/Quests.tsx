import {CONTENT_RATINGS, GENRES, LANGUAGES, PARTITIONS, THEMES} from './Constants';
import {copyAndUnsetDefaults, field, NOW, PLACEHOLDER_DATE, SchemaBase} from './SchemaBase';

export class Quest extends SchemaBase {
  public static create(fields: Partial<Quest>) {
    return super.initialize(this, fields);
  }

  constructor(fields: Partial<Quest>) {
    super(fields);
  }

  public withoutDefaults() {
    return copyAndUnsetDefaults(Quest, this);
  }

  @field({
    primaryKey: true,
    allowNull: false,
    maxLength: 32,
    valid: PARTITIONS,
  }) public partition: string;

  @field({
    primaryKey: true,
    allowNull: false,
    maxLength: 255,
  }) public id: string;

  @field({
    default: 1,
  }) public questversion: number;

  @field({
    default: 1,
  }) public questversionlastmajor: number;

  @field({
    maxLength: 128,
    default: '',
  }) public engineversion: string;

  @field({
    maxLength: 2048,
    default: '',
  }) public publishedurl: string;

  @field({
    maxLength: 255,
    default: '',
  }) public userid: string;

  @field({
    maxLength: 255,
    default: '',
  }) public author: string;

  @field({
    maxLength: 255,
    default: '',
  }) public email: string;

  @field({
    default: 6,
  }) public maxplayers: number;

  @field({
    default: 90,
  }) public maxtimeminutes: number;

  @field({
    default: 1,
  }) public minplayers: number;

  @field({
    default: 0,
  }) public mintimeminutes: number;

  @field({
    maxLength: 1024,
    default: '',
  }) public summary: string;

  @field({
    maxLength: 255,
    default: '',
  }) public title: string;

  @field({
    maxLength: 2048,
    default: '',
  }) public url: string;

  @field({
    default: false,
  }) public familyfriendly: boolean;

  @field({
    default: 0,
    extra: 'DECIMAL_4_2',
  }) public ratingavg: number;

  @field({
    default: 0,
  }) public ratingcount: number;

  @field({
    valid: GENRES,
    maxLength: 128,
    default: '',
  }) public genre: string;

  @field({
    valid: CONTENT_RATINGS,
    maxLength: 128,
    default: '',
  }) public contentrating: string;

  @field({
    default: NOW,
  }) public created: Date;

  @field({
    default: NOW,
  }) public published: Date;

  @field({
    allowNull: true,
    default: PLACEHOLDER_DATE,
  }) public tombstone: Date;

  @field({
    default: false,
  }) public expansionhorror: boolean;

  @field({
    valid: LANGUAGES,
    maxLength: 128,
    default: 'English',
  }) public language: string;

  @field({
    valid: THEMES,
    maxLength: 128,
    default: 'base',
  }) public theme: string;

  @field({
    default: false,
  }) public official: boolean;

  @field({
    maxLength: 128,
    default: '',
  }) public awarded: string;

  @field({
    default: false,
  }) public requirespenpaper: boolean;
}

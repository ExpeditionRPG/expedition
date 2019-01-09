import {ContentRating, enumValues, Genre, Language, Partition, Theme} from './Constants';
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
    allowNull: false,
    maxLength: 32,
    primaryKey: true,
    valid: enumValues(Partition),
  }) public partition: string;

  @field({
    allowNull: false,
    maxLength: 255,
    primaryKey: true,
  }) public id: string;

  @field({
    default: 1,
  }) public questversion: number;

  @field({
    default: 1,
  }) public questversionlastmajor: number;

  @field({
    default: '',
    maxLength: 128,
  }) public engineversion: string;

  @field({
    default: '',
    maxLength: 2048,
  }) public publishedurl: string;

  @field({
    default: '',
    maxLength: 255,
  }) public userid: string;

  @field({
    default: '',
    maxLength: 255,
  }) public author: string;

  @field({
    default: '',
    maxLength: 255,
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
    default: '',
    maxLength: 1024,
  }) public summary: string;

  @field({
    default: '',
    maxLength: 255,
  }) public title: string;

  @field({
    default: '',
    maxLength: 2048,
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
    default: '',
    maxLength: 128,
    valid: enumValues(Genre),
  }) public genre: string;

  @field({
    default: '',
    maxLength: 128,
    valid: enumValues(ContentRating),
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
    default: false,
  }) public expansionfuture: boolean;

  @field({
    default: 'English',
    maxLength: 128,
    valid: enumValues(Language),
  }) public language: string;

  @field({
    default: 'base',
    maxLength: 128,
    valid: enumValues(Theme),
  }) public theme: string;

  @field({
    default: false,
  }) public official: boolean;

  @field({
    default: '',
    maxLength: 128,
  }) public awarded: string;

  @field({
    default: false,
  }) public requirespenpaper: boolean;
}

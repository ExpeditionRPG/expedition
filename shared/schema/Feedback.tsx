import {Difficulty, enumValues, Partition} from './Constants';
import {copyAndUnsetDefaults, field, NOW, PLACEHOLDER_DATE, SchemaBase} from './SchemaBase';

export class Feedback extends SchemaBase {
  public static create(fields: Partial<Feedback>) {
    return super.initialize(this, fields);
  }

  constructor(fields: Partial<Feedback>) {
    super(fields);
  }

  public withoutDefaults() {
    return copyAndUnsetDefaults(Feedback, this);
  }

  @field({
    allowNull: false,
    maxLength: 32,
    primaryKey: true,
    valid: [...enumValues(Partition), ''],
  }) public partition: string;

  @field({
    allowNull: false,
    maxLength: 255,
    primaryKey: true,
  }) public questid: string;

  @field({
    allowNull: true,
  }) public questline: number;

  @field({
    allowNull: false,
    maxLength: 255,
    primaryKey: true,
  }) public userid: string;

  @field({
    default: 1,
  }) public questversion: number;

  @field({
    default: 0,
  }) public rating: number;

  @field({
    default: '',
    maxLength: 2048,
  }) public text: string;

  @field({
    default: '',
    maxLength: 255,
  }) public email: string;

  @field({
    default: '',
  }) public stats: string;

  @field({
    default: false,
  }) public anonymous: boolean;

  @field({
    allowNull: true,
    default: PLACEHOLDER_DATE,
  }) public tombstone: Date;

  @field({
    default: '',
    maxLength: 255,
  }) public name: string;

  @field({
    default: 'NORMAL',
    maxLength: 32,
    valid: enumValues(Difficulty),
  }) public difficulty: string;

  @field({
    default: '',
    maxLength: 32,
  }) public platform: string;

  @field({
    default: NOW,
  }) public created: Date;

  @field({
    default: 0,
  }) public players: number;

  @field({
    default: '',
    maxLength: 32,
  }) public version: string;
}

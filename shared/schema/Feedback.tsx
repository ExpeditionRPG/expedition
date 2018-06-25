import {DIFFICULTIES, PARTITIONS} from './Constants';
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
    primaryKey: true,
    allowNull: false,
    maxLength: 32,
    valid: [...PARTITIONS, ''],
  }) public partition: string;

  @field({
    primaryKey: true,
    allowNull: false,
    maxLength: 255,
  }) public questid: string;

  @field({
    primaryKey: true,
    allowNull: false,
    maxLength: 255,
  }) public userid: string;

  @field({
    default: 1,
  }) public questversion: number;

  @field({
    default: 0,
  }) public rating: number;

  @field({
    maxLength: 2048,
    default: '',
  }) public text: string;

  @field({
    maxLength: 255,
    default: '',
  }) public email: string;

  @field({
    default: false,
  }) public anonymous: boolean;

  @field({
    allowNull: true,
    default: PLACEHOLDER_DATE,
  }) public tombstone: Date;

  @field({
    maxLength: 255,
    default: '',
  }) public name: string;

  @field({
    maxLength: 32,
    default: 'NORMAL',
    valid: DIFFICULTIES,
  }) public difficulty: string;

  @field({
    maxLength: 32,
    default: '',
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

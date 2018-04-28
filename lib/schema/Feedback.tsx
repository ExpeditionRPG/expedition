import {SchemaBase, field, copyAndUnsetDefaults, NOW, PLACEHOLDER_DATE} from './SchemaBase'
import {PARTITIONS, DIFFICULTIES} from './Constants'

export class Feedback extends SchemaBase {
  static create(fields: Partial<Feedback>) {
    return super.initialize(this, fields);
  }

  constructor(fields: Partial<Feedback>) {
    super(fields);
  }

  withoutDefaults() {
    return copyAndUnsetDefaults(Feedback, this);
  }

  @field({
    primaryKey: true,
    allowNull: false,
    maxLength: 32,
    valid: [...PARTITIONS, ''],
  }) partition: string;

  @field({
    primaryKey: true,
    allowNull: false,
    maxLength: 255,
  }) questid: string;

  @field({
    primaryKey: true,
    allowNull: false,
    maxLength: 255,
  }) userid: string;

  @field({
    default: 1,
  }) questversion: number;

  @field({
    default: 0,
  }) rating: number;

  @field({
    maxLength: 2048,
    default: '',
  }) text: string;

  @field({
    maxLength: 255,
    default: '',
  }) email: string;

  @field({
    default: false,
  }) anonymous: boolean;

  @field({
    allowNull: true,
    default: PLACEHOLDER_DATE,
  }) tombstone: Date;

  @field({
    maxLength: 255,
    default: '',
  }) name: string;

  @field({
    maxLength: 32,
    default: 'NORMAL',
    valid: DIFFICULTIES,
  }) difficulty: string;

  @field({
    maxLength: 32,
    default: '',
  }) platform: string;

  @field({
    default: NOW,
  }) created: Date;

  @field({
    default: 0,
  }) players: number;
}

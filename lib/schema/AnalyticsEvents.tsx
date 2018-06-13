import {SchemaBase, field, copyAndUnsetDefaults, NOW} from './SchemaBase'
import {DIFFICULTIES} from './Constants'

export class AnalyticsEvent extends SchemaBase {
  static create(fields: Partial<AnalyticsEvent>) {
    return super.initialize(this, fields);
  }

  constructor(fields: Partial<AnalyticsEvent>) {
    super(fields);
  }

  withoutDefaults() {
    return copyAndUnsetDefaults(AnalyticsEvent, this);
  }

  @field({
    primaryKey: true,
    allowNull: false,
    maxLength: 255,
    column: 'user_id',
  }) userID: string;

  @field({
    primaryKey: true,
    default: NOW,
  }) created: Date

  @field({
    maxLength: 255,
    default: '',
    allowNull: false,
  }) category: string;

  @field({
    maxLength: 255,
    default: '',
    allowNull: false,
  }) action: string;

  @field({
    default: '',
    maxLength: 255,
    column: 'quest_id',
  }) questID: string;

  @field({
    default: 1,
    column: 'quest_version',
  }) questVersion: number;

  @field({
    maxLength: 32,
    default: '',
    valid: [...DIFFICULTIES, ''],
  }) difficulty: string;

  @field({
    maxLength: 32,
    default: '',
  }) platform: string;

  @field({
    default: 0,
  }) players: number;

  @field({
    maxLength: 32,
    default: '',
  }) version: string;

  @field({
    default: '',
  }) json: string;
}
